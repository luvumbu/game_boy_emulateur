// src/core/emu/class/Apu.ts
var HORLOGE = 4194304;
var CYCLES_PAR_PAS = HORLOGE / 512;
var RAPPORTS = [
  [0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 0]
];
var DIVISEURS = [8, 16, 32, 48, 64, 80, 96, 112];
var Carre = class {
  constructor(avecBalayage) {
    this.avecBalayage = avecBalayage;
  }
  avecBalayage;
  /* Registres, tels qu'ils ont été écrits. */
  nrx0 = 0;
  nrx1 = 0;
  nrx2 = 0;
  nrx3 = 0;
  nrx4 = 0;
  actif = false;
  compteur = 0;
  // cycles avant le prochain huitième
  huitieme = 0;
  volume = 0;
  pasEnveloppe = 0;
  longueur = 0;
  /* Balayage — canal 1 seulement. */
  freqOmbre = 0;
  balayageActif = false;
  pasBalayage = 0;
  reset() {
    this.nrx0 = this.nrx1 = this.nrx2 = this.nrx3 = this.nrx4 = 0;
    this.actif = false;
    this.compteur = 0;
    this.huitieme = 0;
    this.volume = 0;
    this.longueur = 0;
  }
  /** Le convertisseur est coupé quand les cinq bits hauts de NRx2 sont à zéro. */
  get dacAllume() {
    return (this.nrx2 & 248) !== 0;
  }
  get joue() {
    return this.actif && this.dacAllume;
  }
  get periode() {
    return (this.nrx4 & 7) << 8 | this.nrx3;
  }
  write(index, valeur) {
    switch (index) {
      case 0:
        this.nrx0 = valeur;
        break;
      case 1:
        this.nrx1 = valeur;
        this.longueur = 64 - (valeur & 63);
        break;
      case 2:
        this.nrx2 = valeur;
        if (!this.dacAllume) this.actif = false;
        break;
      case 3:
        this.nrx3 = valeur;
        break;
      case 4:
        this.nrx4 = valeur;
        if (valeur & 128) this.declenche();
        break;
    }
  }
  read(index) {
    const masques = [128, 63, 0, 255, 191];
    const valeurs = [this.nrx0, this.nrx1, this.nrx2, this.nrx3, this.nrx4];
    return valeurs[index] | masques[index];
  }
  /** Le bit 7 de NRx4 : la note repart de zéro. */
  declenche() {
    this.actif = this.dacAllume;
    if (this.longueur === 0) this.longueur = 64;
    this.compteur = (2048 - this.periode) * 4;
    this.volume = this.nrx2 >> 4;
    this.pasEnveloppe = this.nrx2 & 7;
    if (this.avecBalayage) {
      this.freqOmbre = this.periode;
      this.pasBalayage = this.nrx0 >> 4 & 7;
      this.balayageActif = this.pasBalayage !== 0 || (this.nrx0 & 7) !== 0;
    }
  }
  step(cycles) {
    if (!this.actif) return;
    this.compteur -= cycles;
    while (this.compteur <= 0) {
      const periode = (2048 - this.periode) * 4;
      this.compteur += periode > 0 ? periode : 4;
      this.huitieme = this.huitieme + 1 & 7;
    }
  }
  /** Appelé aux pas 0, 2, 4 et 6 du séquenceur. */
  tickLongueur() {
    if ((this.nrx4 & 64) === 0) return;
    if (this.longueur > 0 && --this.longueur === 0) this.actif = false;
  }
  /** Appelé au pas 7 : le volume monte ou descend d'un cran. */
  tickEnveloppe() {
    const periode = this.nrx2 & 7;
    if (periode === 0) return;
    if (--this.pasEnveloppe > 0) return;
    this.pasEnveloppe = periode;
    const monte = (this.nrx2 & 8) !== 0;
    if (monte && this.volume < 15) this.volume++;
    else if (!monte && this.volume > 0) this.volume--;
  }
  /** Appelé aux pas 2 et 6 : la fréquence glisse. */
  tickBalayage() {
    if (!this.avecBalayage || !this.balayageActif) return;
    const periode = this.nrx0 >> 4 & 7;
    if (periode === 0) return;
    if (--this.pasBalayage > 0) return;
    this.pasBalayage = periode;
    const decalage = this.nrx0 & 7;
    const delta = this.freqOmbre >> decalage;
    const suivante = (this.nrx0 & 8) !== 0 ? this.freqOmbre - delta : this.freqOmbre + delta;
    if (suivante > 2047) {
      this.actif = false;
      return;
    }
    if (decalage === 0) return;
    this.freqOmbre = suivante;
    this.nrx3 = suivante & 255;
    this.nrx4 = this.nrx4 & 248 | suivante >> 8 & 7;
  }
  /** L'échantillon courant, de 0 à 15. */
  echantillon() {
    if (!this.joue) return 0;
    return RAPPORTS[this.nrx1 >> 6 & 3][this.huitieme] * this.volume;
  }
};
var Bruit = class {
  nrx1 = 0;
  nrx2 = 0;
  nrx3 = 0;
  nrx4 = 0;
  actif = false;
  compteur = 0;
  registre = 32767;
  volume = 0;
  pasEnveloppe = 0;
  longueur = 0;
  reset() {
    this.nrx1 = this.nrx2 = this.nrx3 = this.nrx4 = 0;
    this.actif = false;
    this.compteur = 0;
    this.registre = 32767;
    this.volume = 0;
    this.longueur = 0;
  }
  get dacAllume() {
    return (this.nrx2 & 248) !== 0;
  }
  get joue() {
    return this.actif && this.dacAllume;
  }
  write(index, valeur) {
    switch (index) {
      case 1:
        this.nrx1 = valeur;
        this.longueur = 64 - (valeur & 63);
        break;
      case 2:
        this.nrx2 = valeur;
        if (!this.dacAllume) this.actif = false;
        break;
      case 3:
        this.nrx3 = valeur;
        break;
      case 4:
        this.nrx4 = valeur;
        if (valeur & 128) this.declenche();
        break;
    }
  }
  read(index) {
    const masques = [255, 255, 0, 0, 191];
    const valeurs = [0, this.nrx1, this.nrx2, this.nrx3, this.nrx4];
    return valeurs[index] | masques[index];
  }
  get periode() {
    return DIVISEURS[this.nrx3 & 7] << (this.nrx3 >> 4);
  }
  declenche() {
    this.actif = this.dacAllume;
    if (this.longueur === 0) this.longueur = 64;
    this.compteur = this.periode;
    this.volume = this.nrx2 >> 4;
    this.pasEnveloppe = this.nrx2 & 7;
    this.registre = 32767;
  }
  step(cycles) {
    if (!this.actif) return;
    this.compteur -= cycles;
    while (this.compteur <= 0) {
      const periode = this.periode;
      this.compteur += periode > 0 ? periode : 8;
      const bit = (this.registre ^ this.registre >> 1) & 1;
      this.registre = this.registre >> 1 | bit << 14;
      if (this.nrx3 & 8) this.registre = this.registre & ~64 | bit << 6;
    }
  }
  tickLongueur() {
    if ((this.nrx4 & 64) === 0) return;
    if (this.longueur > 0 && --this.longueur === 0) this.actif = false;
  }
  tickEnveloppe() {
    const periode = this.nrx2 & 7;
    if (periode === 0) return;
    if (--this.pasEnveloppe > 0) return;
    this.pasEnveloppe = periode;
    const monte = (this.nrx2 & 8) !== 0;
    if (monte && this.volume < 15) this.volume++;
    else if (!monte && this.volume > 0) this.volume--;
  }
  echantillon() {
    if (!this.joue) return 0;
    return (~this.registre & 1) * this.volume;
  }
};
var Apu = class {
  canal1 = new Carre(true);
  canal2 = new Carre(false);
  bruit = new Bruit();
  nr50 = 0;
  nr51 = 0;
  allume = false;
  /** Les seize octets de l'onde programmable : rangés, pas encore joués. */
  waveRam = new Uint8Array(16);
  cyclesSequenceur = 0;
  pasSequenceur = 0;
  /* L'échantillonnage : un compteur qui déborde à chaque échantillon voulu. */
  cyclesEchantillon = 0;
  cyclesParEchantillon = HORLOGE / 44100;
  tampon = [];
  /** Le nombre d'échantillons par seconde produits par `drain`. */
  get frequenceEchantillonnage() {
    return HORLOGE / this.cyclesParEchantillon;
  }
  set frequenceEchantillonnage(valeur) {
    this.cyclesParEchantillon = HORLOGE / valeur;
  }
  reset() {
    this.canal1.reset();
    this.canal2.reset();
    this.bruit.reset();
    this.nr50 = 0;
    this.nr51 = 0;
    this.allume = false;
    this.waveRam.fill(0);
    this.cyclesSequenceur = 0;
    this.pasSequenceur = 0;
    this.cyclesEchantillon = 0;
    this.tampon = [];
  }
  write(adresse, valeur) {
    if (adresse >= 65328) {
      this.waveRam[adresse - 65328] = valeur;
      return;
    }
    if (adresse === 65318) {
      const etait = this.allume;
      this.allume = (valeur & 128) !== 0;
      if (etait && !this.allume) {
        this.canal1.reset();
        this.canal2.reset();
        this.bruit.reset();
        this.nr50 = 0;
        this.nr51 = 0;
      }
      return;
    }
    if (!this.allume) return;
    if (adresse === 65316) {
      this.nr50 = valeur;
      return;
    }
    if (adresse === 65317) {
      this.nr51 = valeur;
      return;
    }
    if (adresse >= 65296 && adresse <= 65300) {
      this.canal1.write(adresse - 65296, valeur);
      return;
    }
    if (adresse >= 65301 && adresse <= 65305) {
      this.canal2.write(adresse - 65301, valeur);
      return;
    }
    if (adresse >= 65311 && adresse <= 65315) {
      this.bruit.write(adresse - 65311, valeur);
    }
  }
  read(adresse) {
    if (adresse >= 65328) return this.waveRam[adresse - 65328];
    if (adresse === 65316) return this.nr50;
    if (adresse === 65317) return this.nr51;
    if (adresse === 65318) {
      const etats = (this.canal1.joue ? 1 : 0) | (this.canal2.joue ? 2 : 0) | (this.bruit.joue ? 8 : 0);
      return (this.allume ? 128 : 0) | 112 | etats;
    }
    if (adresse >= 65296 && adresse <= 65300) return this.canal1.read(adresse - 65296);
    if (adresse >= 65301 && adresse <= 65305) return this.canal2.read(adresse - 65301);
    if (adresse >= 65311 && adresse <= 65315) return this.bruit.read(adresse - 65311);
    return 255;
  }
  step(cycles) {
    if (!this.allume) {
      this.echantillonner(cycles, 0);
      return;
    }
    this.canal1.step(cycles);
    this.canal2.step(cycles);
    this.bruit.step(cycles);
    this.cyclesSequenceur += cycles;
    while (this.cyclesSequenceur >= CYCLES_PAR_PAS) {
      this.cyclesSequenceur -= CYCLES_PAR_PAS;
      this.pasSequenceur = this.pasSequenceur + 1 & 7;
      if ((this.pasSequenceur & 1) === 0) {
        this.canal1.tickLongueur();
        this.canal2.tickLongueur();
        this.bruit.tickLongueur();
      }
      if (this.pasSequenceur === 2 || this.pasSequenceur === 6) this.canal1.tickBalayage();
      if (this.pasSequenceur === 7) {
        this.canal1.tickEnveloppe();
        this.canal2.tickEnveloppe();
        this.bruit.tickEnveloppe();
      }
    }
    this.echantillonner(cycles, this.melange());
  }
  /**
   * Le mélange des trois canaux, entre -1 et 1.
   *
   * Chaque convertisseur allumé rend une valeur **centrée** : un échantillon de
   * 0 à 15 devient -1 à +1. Un canal éteint rend zéro, et non -1 — sinon un jeu
   * muet produirait une tension continue, donc un claquement à chaque
   * allumage. C'est aussi pourquoi baisser le volume rapproche l'onde de -1 au
   * lieu de la rapprocher de zéro : le creux du carré ne bouge pas, c'est la
   * crête qui descend.
   */
  melange() {
    const centre = (joue, echantillon) => joue ? echantillon / 7.5 - 1 : 0;
    let somme = 0;
    if (this.nr51 & 17) somme += centre(this.canal1.joue, this.canal1.echantillon());
    if (this.nr51 & 34) somme += centre(this.canal2.joue, this.canal2.echantillon());
    if (this.nr51 & 136) somme += centre(this.bruit.joue, this.bruit.echantillon());
    const gauche = this.nr50 >> 4 & 7;
    const droite = this.nr50 & 7;
    return somme / 3 * ((gauche + droite + 2) / 16);
  }
  echantillonner(cycles, valeur) {
    this.cyclesEchantillon += cycles;
    while (this.cyclesEchantillon >= this.cyclesParEchantillon) {
      this.cyclesEchantillon -= this.cyclesParEchantillon;
      this.tampon.push(valeur);
    }
  }
  /** Rend les échantillons accumulés et vide le tampon. */
  drain() {
    const sortie = Float32Array.from(this.tampon);
    this.tampon = [];
    return sortie;
  }
  /** Vrai si au moins un canal produit du son en ce moment. */
  get sonne() {
    return this.allume && (this.canal1.joue || this.canal2.joue || this.bruit.joue);
  }
};

// src/core/emu/class/Cpu.ts
var FLAG_Z = 128;
var FLAG_N = 64;
var FLAG_H = 32;
var FLAG_C = 16;
var REG_HL_INDIRECT = 6;
var Cpu = class {
  a = 0;
  b = 0;
  c = 0;
  d = 0;
  e = 0;
  h = 0;
  l = 0;
  f = 0;
  sp = 0;
  pc = 0;
  ime = false;
  imePending = false;
  halted = false;
  mmu;
  constructor(mmu) {
    this.mmu = mmu;
  }
  /** Post-boot-ROM register state, as the DMG leaves it. */
  reset() {
    this.a = 1;
    this.f = 176;
    this.b = 0;
    this.c = 19;
    this.d = 0;
    this.e = 216;
    this.h = 1;
    this.l = 77;
    this.sp = 65534;
    this.pc = 256;
    this.ime = false;
    this.imePending = false;
    this.halted = false;
  }
  step() {
    const imeWasPending = this.imePending;
    const serviced = this.serviceInterrupts();
    if (serviced > 0) return serviced;
    if (this.halted) return 4;
    const cycles = this.execute();
    if (imeWasPending) {
      this.ime = true;
      this.imePending = false;
    }
    return cycles;
  }
  serviceInterrupts() {
    const pending = this.mmu.interruptEnable & this.mmu.interruptFlags & 31;
    if (pending === 0) return 0;
    this.halted = false;
    if (!this.ime) return 0;
    this.ime = false;
    for (let bit = 0; bit < 5; bit++) {
      if ((pending & 1 << bit) === 0) continue;
      this.mmu.interruptFlags &= ~(1 << bit);
      this.push16(this.pc);
      this.pc = 64 + bit * 8;
      return 20;
    }
    return 0;
  }
  /* --------------------------------------------------------- register pairs */
  get bc() {
    return this.b << 8 | this.c;
  }
  set bc(value) {
    this.b = value >> 8 & 255;
    this.c = value & 255;
  }
  get de() {
    return this.d << 8 | this.e;
  }
  set de(value) {
    this.d = value >> 8 & 255;
    this.e = value & 255;
  }
  get hl() {
    return this.h << 8 | this.l;
  }
  set hl(value) {
    this.h = value >> 8 & 255;
    this.l = value & 255;
  }
  get af() {
    return this.a << 8 | this.f;
  }
  set af(value) {
    this.a = value >> 8 & 255;
    this.f = value & 240;
  }
  /* ----------------------------------------------------------------- flags */
  get flagZ() {
    return (this.f & FLAG_Z) !== 0;
  }
  get flagN() {
    return (this.f & FLAG_N) !== 0;
  }
  get flagH() {
    return (this.f & FLAG_H) !== 0;
  }
  get flagC() {
    return (this.f & FLAG_C) !== 0;
  }
  setFlags(z, n, h, c) {
    this.f = (z ? FLAG_Z : 0) | (n ? FLAG_N : 0) | (h ? FLAG_H : 0) | (c ? FLAG_C : 0);
  }
  setCarry(value) {
    this.f = value ? this.f | FLAG_C : this.f & ~FLAG_C;
  }
  /* ------------------------------------------------------------ memory access */
  fetch8() {
    const value = this.mmu.read(this.pc);
    this.pc = this.pc + 1 & 65535;
    return value;
  }
  fetch16() {
    const low = this.fetch8();
    return low | this.fetch8() << 8;
  }
  push16(value) {
    this.sp = this.sp - 1 & 65535;
    this.mmu.write(this.sp, value >> 8 & 255);
    this.sp = this.sp - 1 & 65535;
    this.mmu.write(this.sp, value & 255);
  }
  pop16() {
    const low = this.mmu.read(this.sp);
    this.sp = this.sp + 1 & 65535;
    const high = this.mmu.read(this.sp);
    this.sp = this.sp + 1 & 65535;
    return high << 8 | low;
  }
  readR(index) {
    switch (index) {
      case 0:
        return this.b;
      case 1:
        return this.c;
      case 2:
        return this.d;
      case 3:
        return this.e;
      case 4:
        return this.h;
      case 5:
        return this.l;
      case 6:
        return this.mmu.read(this.hl);
      default:
        return this.a;
    }
  }
  writeR(index, value) {
    const byte = value & 255;
    switch (index) {
      case 0:
        this.b = byte;
        break;
      case 1:
        this.c = byte;
        break;
      case 2:
        this.d = byte;
        break;
      case 3:
        this.e = byte;
        break;
      case 4:
        this.h = byte;
        break;
      case 5:
        this.l = byte;
        break;
      case 6:
        this.mmu.write(this.hl, byte);
        break;
      default:
        this.a = byte;
        break;
    }
  }
  /* --------------------------------------------------------------- dispatch */
  execute() {
    const opcode = this.fetch8();
    if (opcode >= 64 && opcode <= 127) {
      if (opcode === 118) {
        this.halted = true;
        return 4;
      }
      const dst = opcode >> 3 & 7;
      const src = opcode & 7;
      this.writeR(dst, this.readR(src));
      return dst === REG_HL_INDIRECT || src === REG_HL_INDIRECT ? 8 : 4;
    }
    if (opcode >= 128 && opcode <= 191) {
      const src = opcode & 7;
      this.alu(opcode >> 3 & 7, this.readR(src));
      return src === REG_HL_INDIRECT ? 8 : 4;
    }
    switch (opcode) {
      case 0:
        return 4;
      // NOP
      case 16:
        this.fetch8();
        return 4;
      // STOP swallows its padding byte
      /* ---- 16-bit loads and arithmetic ---- */
      case 1:
        this.bc = this.fetch16();
        return 12;
      case 17:
        this.de = this.fetch16();
        return 12;
      case 33:
        this.hl = this.fetch16();
        return 12;
      case 49:
        this.sp = this.fetch16();
        return 12;
      case 8: {
        const address = this.fetch16();
        this.mmu.write(address, this.sp & 255);
        this.mmu.write(address + 1 & 65535, this.sp >> 8 & 255);
        return 20;
      }
      case 3:
        this.bc = this.bc + 1 & 65535;
        return 8;
      case 19:
        this.de = this.de + 1 & 65535;
        return 8;
      case 35:
        this.hl = this.hl + 1 & 65535;
        return 8;
      case 51:
        this.sp = this.sp + 1 & 65535;
        return 8;
      case 11:
        this.bc = this.bc - 1 & 65535;
        return 8;
      case 27:
        this.de = this.de - 1 & 65535;
        return 8;
      case 43:
        this.hl = this.hl - 1 & 65535;
        return 8;
      case 59:
        this.sp = this.sp - 1 & 65535;
        return 8;
      case 9:
        this.addHl(this.bc);
        return 8;
      case 25:
        this.addHl(this.de);
        return 8;
      case 41:
        this.addHl(this.hl);
        return 8;
      case 57:
        this.addHl(this.sp);
        return 8;
      case 232:
        this.sp = this.addSignedToWord(this.sp, this.signedFetch());
        return 16;
      case 248:
        this.hl = this.addSignedToWord(this.sp, this.signedFetch());
        return 12;
      case 249:
        this.sp = this.hl;
        return 8;
      /* ---- 8-bit loads ---- */
      case 2:
        this.mmu.write(this.bc, this.a);
        return 8;
      case 18:
        this.mmu.write(this.de, this.a);
        return 8;
      case 34:
        this.mmu.write(this.hl, this.a);
        this.hl = this.hl + 1 & 65535;
        return 8;
      case 50:
        this.mmu.write(this.hl, this.a);
        this.hl = this.hl - 1 & 65535;
        return 8;
      case 10:
        this.a = this.mmu.read(this.bc);
        return 8;
      case 26:
        this.a = this.mmu.read(this.de);
        return 8;
      case 42:
        this.a = this.mmu.read(this.hl);
        this.hl = this.hl + 1 & 65535;
        return 8;
      case 58:
        this.a = this.mmu.read(this.hl);
        this.hl = this.hl - 1 & 65535;
        return 8;
      case 6:
        this.b = this.fetch8();
        return 8;
      case 14:
        this.c = this.fetch8();
        return 8;
      case 22:
        this.d = this.fetch8();
        return 8;
      case 30:
        this.e = this.fetch8();
        return 8;
      case 38:
        this.h = this.fetch8();
        return 8;
      case 46:
        this.l = this.fetch8();
        return 8;
      case 54:
        this.mmu.write(this.hl, this.fetch8());
        return 12;
      case 62:
        this.a = this.fetch8();
        return 8;
      case 224:
        this.mmu.write(65280 + this.fetch8(), this.a);
        return 12;
      case 240:
        this.a = this.mmu.read(65280 + this.fetch8());
        return 12;
      case 226:
        this.mmu.write(65280 + this.c, this.a);
        return 8;
      case 242:
        this.a = this.mmu.read(65280 + this.c);
        return 8;
      case 234:
        this.mmu.write(this.fetch16(), this.a);
        return 16;
      case 250:
        this.a = this.mmu.read(this.fetch16());
        return 16;
      /* ---- 8-bit INC/DEC ---- */
      case 4:
        this.b = this.inc8(this.b);
        return 4;
      case 12:
        this.c = this.inc8(this.c);
        return 4;
      case 20:
        this.d = this.inc8(this.d);
        return 4;
      case 28:
        this.e = this.inc8(this.e);
        return 4;
      case 36:
        this.h = this.inc8(this.h);
        return 4;
      case 44:
        this.l = this.inc8(this.l);
        return 4;
      case 60:
        this.a = this.inc8(this.a);
        return 4;
      case 52:
        this.mmu.write(this.hl, this.inc8(this.mmu.read(this.hl)));
        return 12;
      case 5:
        this.b = this.dec8(this.b);
        return 4;
      case 13:
        this.c = this.dec8(this.c);
        return 4;
      case 21:
        this.d = this.dec8(this.d);
        return 4;
      case 29:
        this.e = this.dec8(this.e);
        return 4;
      case 37:
        this.h = this.dec8(this.h);
        return 4;
      case 45:
        this.l = this.dec8(this.l);
        return 4;
      case 61:
        this.a = this.dec8(this.a);
        return 4;
      case 53:
        this.mmu.write(this.hl, this.dec8(this.mmu.read(this.hl)));
        return 12;
      /* ---- immediate ALU ---- */
      case 198:
        this.alu(0, this.fetch8());
        return 8;
      case 206:
        this.alu(1, this.fetch8());
        return 8;
      case 214:
        this.alu(2, this.fetch8());
        return 8;
      case 222:
        this.alu(3, this.fetch8());
        return 8;
      case 230:
        this.alu(4, this.fetch8());
        return 8;
      case 238:
        this.alu(5, this.fetch8());
        return 8;
      case 246:
        this.alu(6, this.fetch8());
        return 8;
      case 254:
        this.alu(7, this.fetch8());
        return 8;
      /* ---- accumulator rotates (these always clear Z) ---- */
      case 7: {
        const carry = (this.a & 128) !== 0;
        this.a = (this.a << 1 | (carry ? 1 : 0)) & 255;
        this.setFlags(false, false, false, carry);
        return 4;
      }
      case 15: {
        const carry = (this.a & 1) !== 0;
        this.a = (this.a >> 1 | (carry ? 128 : 0)) & 255;
        this.setFlags(false, false, false, carry);
        return 4;
      }
      case 23: {
        const carry = (this.a & 128) !== 0;
        this.a = (this.a << 1 | (this.flagC ? 1 : 0)) & 255;
        this.setFlags(false, false, false, carry);
        return 4;
      }
      case 31: {
        const carry = (this.a & 1) !== 0;
        this.a = (this.a >> 1 | (this.flagC ? 128 : 0)) & 255;
        this.setFlags(false, false, false, carry);
        return 4;
      }
      /* ---- flag and accumulator fiddling ---- */
      case 39:
        this.daa();
        return 4;
      case 47:
        this.a = ~this.a & 255;
        this.f |= FLAG_N | FLAG_H;
        return 4;
      case 55:
        this.f = this.f & FLAG_Z | FLAG_C;
        return 4;
      case 63:
        this.f = this.f & FLAG_Z | (this.flagC ? 0 : FLAG_C);
        return 4;
      /* ---- jumps ---- */
      case 24: {
        const offset = this.signedFetch();
        this.pc = this.pc + offset & 65535;
        return 12;
      }
      case 32:
        return this.jumpRelative(!this.flagZ);
      case 40:
        return this.jumpRelative(this.flagZ);
      case 48:
        return this.jumpRelative(!this.flagC);
      case 56:
        return this.jumpRelative(this.flagC);
      case 195:
        this.pc = this.fetch16();
        return 16;
      case 194:
        return this.jumpAbsolute(!this.flagZ);
      case 202:
        return this.jumpAbsolute(this.flagZ);
      case 210:
        return this.jumpAbsolute(!this.flagC);
      case 218:
        return this.jumpAbsolute(this.flagC);
      case 233:
        this.pc = this.hl;
        return 4;
      /* ---- calls and returns ---- */
      case 205: {
        const target = this.fetch16();
        this.push16(this.pc);
        this.pc = target;
        return 24;
      }
      case 196:
        return this.call(!this.flagZ);
      case 204:
        return this.call(this.flagZ);
      case 212:
        return this.call(!this.flagC);
      case 220:
        return this.call(this.flagC);
      case 201:
        this.pc = this.pop16();
        return 16;
      case 192:
        return this.ret(!this.flagZ);
      case 200:
        return this.ret(this.flagZ);
      case 208:
        return this.ret(!this.flagC);
      case 216:
        return this.ret(this.flagC);
      case 217:
        this.pc = this.pop16();
        this.ime = true;
        return 16;
      /* ---- stack ---- */
      case 193:
        this.bc = this.pop16();
        return 12;
      case 209:
        this.de = this.pop16();
        return 12;
      case 225:
        this.hl = this.pop16();
        return 12;
      case 241:
        this.af = this.pop16();
        return 12;
      case 197:
        this.push16(this.bc);
        return 16;
      case 213:
        this.push16(this.de);
        return 16;
      case 229:
        this.push16(this.hl);
        return 16;
      case 245:
        this.push16(this.af);
        return 16;
      /* ---- restarts ---- */
      case 199:
      case 207:
      case 215:
      case 223:
      case 231:
      case 239:
      case 247:
      case 255:
        this.push16(this.pc);
        this.pc = opcode & 56;
        return 16;
      /* ---- interrupt control ---- */
      case 243:
        this.ime = false;
        this.imePending = false;
        return 4;
      case 251:
        this.imePending = true;
        return 4;
      case 203:
        return this.executeCb();
      default:
        this.halted = true;
        return 4;
    }
  }
  executeCb() {
    const opcode = this.fetch8();
    const target = opcode & 7;
    const value = this.readR(target);
    const onMemory = target === REG_HL_INDIRECT;
    if (opcode < 64) {
      const operation = opcode >> 3 & 7;
      this.writeR(target, this.shift(operation, value));
      return onMemory ? 16 : 8;
    }
    const bit = opcode >> 3 & 7;
    if (opcode < 128) {
      this.f = this.f & FLAG_C | FLAG_H | ((value & 1 << bit) === 0 ? FLAG_Z : 0);
      return onMemory ? 12 : 8;
    }
    if (opcode < 192) {
      this.writeR(target, value & ~(1 << bit));
      return onMemory ? 16 : 8;
    }
    this.writeR(target, value | 1 << bit);
    return onMemory ? 16 : 8;
  }
  /* ------------------------------------------------------------- operations */
  shift(operation, value) {
    let result = 0;
    let carry = false;
    switch (operation) {
      case 0:
        carry = (value & 128) !== 0;
        result = (value << 1 | (carry ? 1 : 0)) & 255;
        break;
      case 1:
        carry = (value & 1) !== 0;
        result = (value >> 1 | (carry ? 128 : 0)) & 255;
        break;
      case 2:
        carry = (value & 128) !== 0;
        result = (value << 1 | (this.flagC ? 1 : 0)) & 255;
        break;
      case 3:
        carry = (value & 1) !== 0;
        result = (value >> 1 | (this.flagC ? 128 : 0)) & 255;
        break;
      case 4:
        carry = (value & 128) !== 0;
        result = value << 1 & 255;
        break;
      case 5:
        carry = (value & 1) !== 0;
        result = (value >> 1 | value & 128) & 255;
        break;
      case 6:
        result = (value >> 4 | value << 4) & 255;
        break;
      default:
        carry = (value & 1) !== 0;
        result = value >> 1 & 255;
        break;
    }
    this.setFlags(result === 0, false, false, carry);
    return result;
  }
  alu(operation, value) {
    switch (operation) {
      case 0:
        this.add8(value, false);
        break;
      case 1:
        this.add8(value, this.flagC);
        break;
      case 2:
        this.sub8(value, false);
        break;
      case 3:
        this.sub8(value, this.flagC);
        break;
      case 4:
        this.a &= value;
        this.setFlags(this.a === 0, false, true, false);
        break;
      case 5:
        this.a ^= value;
        this.setFlags(this.a === 0, false, false, false);
        break;
      case 6:
        this.a |= value;
        this.setFlags(this.a === 0, false, false, false);
        break;
      default: {
        const previous = this.a;
        this.sub8(value, false);
        this.a = previous;
        break;
      }
    }
  }
  add8(value, withCarry) {
    const carryIn = withCarry ? 1 : 0;
    const result = this.a + value + carryIn;
    const halfCarry = (this.a & 15) + (value & 15) + carryIn > 15;
    this.a = result & 255;
    this.setFlags(this.a === 0, false, halfCarry, result > 255);
  }
  sub8(value, withCarry) {
    const carryIn = withCarry ? 1 : 0;
    const result = this.a - value - carryIn;
    const halfCarry = (this.a & 15) - (value & 15) - carryIn < 0;
    this.a = result & 255;
    this.setFlags(this.a === 0, true, halfCarry, result < 0);
  }
  inc8(value) {
    const result = value + 1 & 255;
    this.f = this.f & FLAG_C | (result === 0 ? FLAG_Z : 0) | ((value & 15) === 15 ? FLAG_H : 0);
    return result;
  }
  dec8(value) {
    const result = value - 1 & 255;
    this.f = this.f & FLAG_C | FLAG_N | (result === 0 ? FLAG_Z : 0) | ((value & 15) === 0 ? FLAG_H : 0);
    return result;
  }
  addHl(value) {
    const result = this.hl + value;
    const halfCarry = (this.hl & 4095) + (value & 4095) > 4095;
    this.hl = result & 65535;
    this.f = this.f & FLAG_Z | (halfCarry ? FLAG_H : 0) | (result > 65535 ? FLAG_C : 0);
  }
  /** Shared by `ADD SP, e8` and `LD HL, SP+e8`: flags come from the low byte. */
  addSignedToWord(base, offset) {
    const halfCarry = (base & 15) + (offset & 15) > 15;
    const carry = (base & 255) + (offset & 255) > 255;
    this.setFlags(false, false, halfCarry, carry);
    return base + offset & 65535;
  }
  daa() {
    let value = this.a;
    if (!this.flagN) {
      if (this.flagC || value > 153) {
        value = value + 96 & 255;
        this.setCarry(true);
      }
      if (this.flagH || (value & 15) > 9) value = value + 6 & 255;
    } else {
      if (this.flagC) value = value - 96 & 255;
      if (this.flagH) value = value - 6 & 255;
    }
    this.a = value & 255;
    this.f = this.f & (FLAG_N | FLAG_C) | (this.a === 0 ? FLAG_Z : 0);
  }
  signedFetch() {
    return this.fetch8() << 24 >> 24;
  }
  jumpRelative(condition) {
    const offset = this.signedFetch();
    if (!condition) return 8;
    this.pc = this.pc + offset & 65535;
    return 12;
  }
  jumpAbsolute(condition) {
    const target = this.fetch16();
    if (!condition) return 12;
    this.pc = target;
    return 16;
  }
  call(condition) {
    const target = this.fetch16();
    if (!condition) return 12;
    this.push16(this.pc);
    this.pc = target;
    return 24;
  }
  ret(condition) {
    if (!condition) return 8;
    this.pc = this.pop16();
    return 20;
  }
};

// src/core/emu/class/Joypad.ts
var DIRECTION_ORDER = ["right", "left", "up", "down"];
var BUTTON_ORDER = ["a", "b", "select", "start"];
var Joypad = class {
  pressed = /* @__PURE__ */ new Set();
  select = 48;
  reset() {
    this.pressed.clear();
    this.select = 48;
  }
  setPressed(button, isDown) {
    if (isDown) this.pressed.add(button);
    else this.pressed.delete(button);
  }
  releaseAll() {
    this.pressed.clear();
  }
  read() {
    let bits = 15;
    if ((this.select & 16) === 0) bits &= this.rowBits(DIRECTION_ORDER);
    if ((this.select & 32) === 0) bits &= this.rowBits(BUTTON_ORDER);
    return 192 | this.select & 48 | bits;
  }
  write(value) {
    this.select = value & 48;
  }
  rowBits(order) {
    let bits = 15;
    order.forEach((button, index) => {
      if (this.pressed.has(button)) bits &= ~(1 << index) & 15;
    });
    return bits;
  }
};

// src/core/emu/class/Mmu.ts
function mbcKindFor(cartridgeType) {
  if (cartridgeType >= 1 && cartridgeType <= 3) return "mbc1";
  if (cartridgeType >= 15 && cartridgeType <= 19) return "mbc3";
  if (cartridgeType >= 25 && cartridgeType <= 30) return "mbc5";
  return "none";
}
var Mmu = class {
  constructor(ppu, timer, joypad, apu = new Apu()) {
    this.ppu = ppu;
    this.timer = timer;
    this.joypad = joypad;
    this.apu = apu;
  }
  ppu;
  timer;
  joypad;
  apu;
  rom = new Uint8Array(32768);
  externalRam = new Uint8Array(32768);
  /*
   * Huit banques de 4 Ko, et non plus deux.
   *
   * $C000-$CFFF est toujours la banque 0 ; $D000-$DFFF est celle que SVBK
   * désigne, de 1 à 7. Le compilateur de ce projet range tout dans la banque
   * fixe, donc rien ne change pour lui — mais une cartouche venue d'ailleurs
   * s'attend à les trouver, et sans elles elle écrirait ses variables
   * par-dessus les nôtres sans que rien ne le dise.
   */
  wram = new Uint8Array(32768);
  svbk = 1;
  hram = new Uint8Array(127);
  interruptFlags = 0;
  interruptEnable = 0;
  mbc = "none";
  romBank = 1;
  ramBank = 0;
  ramEnabled = false;
  bankingMode = 0;
  loadRom(rom) {
    this.rom = rom;
    this.mbc = mbcKindFor(rom[327] ?? 0);
    /*
     * Le mode couleur se lit en $0143, et nulle part ailleurs.
     *
     *   $80  la cartouche PROFITE de la couleur, et tourne aussi sur une
     *        Game Boy d'origine
     *   $C0  elle l'EXIGE
     *
     * Toute autre valeur — dont zéro — est une cartouche d'origine, rendue en
     * quatre nuances exactement comme avant.
     */
    const drapeauCouleur = rom[323] ?? 0;
    this.ppu.couleur = drapeauCouleur === 128 || drapeauCouleur === 192;
    this.svbk = 1;
  }
  reset() {
    this.externalRam.fill(0);
    this.wram.fill(0);
    this.hram.fill(0);
    this.apu.reset();
    this.interruptFlags = 225;
    this.interruptEnable = 0;
    this.romBank = 1;
    this.ramBank = 0;
    this.ramEnabled = false;
    this.bankingMode = 0;
  }
  read(address) {
    address &= 65535;
    if (address < 16384) {
      return this.rom[address] ?? 255;
    }
    if (address < 32768) {
      const offset = this.romBank * 16384 + (address - 16384);
      return this.rom[offset % Math.max(1, this.rom.length)] ?? 255;
    }
    if (address < 40960) return this.ppu.vram[this.ppu.vbk * 8192 + (address - 32768)];
    if (address < 49152) {
      if (!this.ramEnabled) return 255;
      return this.externalRam[(this.ramBank * 8192 + (address - 40960)) % this.externalRam.length];
    }
    if (address < 53248) return this.wram[address - 49152];
    if (address < 57344) return this.wram[Math.max(1, this.svbk) * 4096 + (address - 53248)];
    /* L'écho de $E000 rejoue $C000, banque comprise. */
    if (address < 61440) return this.wram[address - 57344];
    if (address < 65024) return this.wram[Math.max(1, this.svbk) * 4096 + (address - 61440)];
    if (address < 65184) return this.ppu.oam[address - 65024];
    if (address < 65280) return 255;
    if (address < 65408) return this.readIo(address);
    if (address < 65535) return this.hram[address - 65408];
    return this.interruptEnable;
  }
  write(address, value) {
    address &= 65535;
    value &= 255;
    if (address < 32768) {
      this.writeBankingRegister(address, value);
      return;
    }
    if (address < 40960) {
      this.ppu.vram[this.ppu.vbk * 8192 + (address - 32768)] = value;
      return;
    }
    if (address < 49152) {
      if (this.ramEnabled) {
        this.externalRam[(this.ramBank * 8192 + (address - 40960)) % this.externalRam.length] = value;
      }
      return;
    }
    if (address < 53248) {
      this.wram[address - 49152] = value;
      return;
    }
    if (address < 57344) {
      this.wram[Math.max(1, this.svbk) * 4096 + (address - 53248)] = value;
      return;
    }
    if (address < 61440) {
      this.wram[address - 57344] = value;
      return;
    }
    if (address < 65024) {
      this.wram[Math.max(1, this.svbk) * 4096 + (address - 61440)] = value;
      return;
    }
    if (address < 65184) {
      this.ppu.oam[address - 65024] = value;
      return;
    }
    if (address < 65280) return;
    if (address < 65408) {
      this.writeIo(address, value);
      return;
    }
    if (address < 65535) {
      this.hram[address - 65408] = value;
      return;
    }
    this.interruptEnable = value;
  }
  writeBankingRegister(address, value) {
    if (this.mbc === "none") return;
    if (address < 8192) {
      this.ramEnabled = (value & 15) === 10;
      return;
    }
    if (this.mbc === "mbc5") {
      if (address < 12288) {
        this.romBank = this.romBank & 256 | value;
      } else if (address < 16384) {
        this.romBank = this.romBank & 255 | (value & 1) << 8;
      } else if (address < 24576) {
        this.ramBank = value & 15;
      }
      if (this.romBank === 0) this.romBank = 0;
      return;
    }
    if (address < 16384) {
      const low = this.mbc === "mbc3" ? value & 127 : value & 31;
      this.romBank = this.romBank & ~127 | (low === 0 ? 1 : low);
      return;
    }
    if (address < 24576) {
      if (this.mbc === "mbc3") {
        this.ramBank = value & 15;
      } else if (this.bankingMode === 0) {
        this.romBank = this.romBank & 31 | (value & 3) << 5;
      } else {
        this.ramBank = value & 3;
      }
      return;
    }
    this.bankingMode = value & 1;
  }
  readIo(address) {
    if (address === 65280) return this.joypad.read();
    if (address >= 65284 && address <= 65287) return this.timer.read(address);
    if (address === 65295) return this.interruptFlags | 224;
    if (address >= 65296 && address <= 65343) return this.apu.read(address);
    if (address >= 65344 && address <= 65355) return this.ppu.read(address);
    if (address === 65359 || address >= 65384 && address <= 65387) return this.ppu.read(address);
    if (address === 65392) return this.svbk | 248;
    return 255;
  }
  writeIo(address, value) {
    if (address === 65280) {
      this.joypad.write(value);
      return;
    }
    if (address >= 65284 && address <= 65287) {
      this.timer.write(address, value);
      return;
    }
    if (address === 65295) {
      this.interruptFlags = value & 31;
      return;
    }
    if (address >= 65296 && address <= 65343) {
      this.apu.write(address, value);
      return;
    }
    if (address === 65359 || address >= 65384 && address <= 65387) {
      this.ppu.write(address, value);
      return;
    }
    if (address === 65392) {
      this.svbk = value & 7;
      return;
    }
    if (address === 65350) {
      this.runOamDma(value);
      return;
    }
    if (address >= 65344 && address <= 65355) {
      this.ppu.write(address, value);
      return;
    }
  }
  /** OAM DMA takes 160 machine cycles on hardware; we copy it instantly. */
  runOamDma(page) {
    const source = page << 8;
    for (let i = 0; i < 160; i++) {
      this.ppu.oam[i] = this.read(source + i);
    }
  }
  requestInterrupt(bits) {
    this.interruptFlags |= bits & 31;
  }
};

// src/core/emu/constants.ts
var SCREEN_WIDTH = 160;
var SCREEN_HEIGHT = 144;
var CYCLES_PER_FRAME = 70224;
var VBLANK_INTERRUPT = 1 << 0;
var STAT_INTERRUPT = 1 << 1;
var TIMER_INTERRUPT = 1 << 2;
var JOYPAD_INTERRUPT = 1 << 4;

// src/core/emu/class/Ppu.ts
var OAM_SCAN_CYCLES = 80;
var DRAW_CYCLES = 172;
var HBLANK_CYCLES = 204;
var LINE_CYCLES = OAM_SCAN_CYCLES + DRAW_CYCLES + HBLANK_CYCLES;
var LCDC_BG_ENABLE = 1;
var LCDC_OBJ_ENABLE = 2;
var LCDC_OBJ_TALL = 4;
var LCDC_BG_MAP_HIGH = 8;
var LCDC_TILE_DATA_LOW = 16;
var LCDC_WINDOW_ENABLE = 32;
var LCDC_WINDOW_MAP_HIGH = 64;
var LCDC_ENABLE = 128;
var MAX_SPRITES_PER_LINE = 10;
/*
 * Les quatre nuances d'origine, en BGR555 — le format de la Game Boy Color.
 *
 * Une cartouche qui ne pose aucune palette doit rester VERTE, et non noire :
 * sur une vraie console, c'est le programme de démarrage qui met ces valeurs.
 * Sans elles, tout programme d'avant deviendrait un écran noir le jour où on
 * le lance en mode couleur — et l'on chercherait la faute dans le programme.
 */
var NUANCES_DMG = [
  26 << 10 | 31 << 5 | 28,
  14 << 10 | 24 << 5 | 17,
  10 << 10 | 13 << 5 | 6,
  4 << 10 | 3 << 5 | 1
];
var Ppu = class {
  /* DEUX banques de 8 Ko : la seconde porte les attributs de chaque case de
     la carte — sa palette, son retournement, sa priorité. */
  vram = new Uint8Array(16384);
  vbk = 0;
  oam = new Uint8Array(160);
  /* Le mode couleur, lu dans l'en-tête de la cartouche en $0143. */
  couleur = false;
  /* Huit palettes de quatre couleurs, deux octets chacune, pour le fond et
     pour les lutins. L'index s'auto-incrémente à l'écriture : c'est ce qui
     permet de verser une palette entière sans le reposer huit fois. */
  bgPalettes = new Uint8Array(64);
  objPalettes = new Uint8Array(64);
  bcps = 0;
  ocps = 0;
  /** One shade (0-3) per pixel, ready for the UI to colourise. */
  framebuffer = new Uint8Array(SCREEN_WIDTH * SCREEN_HEIGHT);
  /*
   * L'écran en couleurs, à côté de l'écran en nuances.
   *
   * `framebuffer` garde le numéro de nuance, de 0 à 3, comme il l'a toujours
   * fait : toute la page, les captures et les contrôles le lisent. `couleurs`
   * porte EN PLUS la couleur vraie, en BGR555. Remplacer l'un par l'autre
   * aurait cassé dix-sept suites de contrôles pour n'ajouter rien ; les tenir
   * tous les deux coûte un tableau de 46 Ko et ne casse personne.
   */
  couleurs = new Uint16Array(SCREEN_WIDTH * SCREEN_HEIGHT);
  /** Set when a frame completes; the caller clears it. */
  frameReady = false;
  lcdc = 0;
  stat = 0;
  scy = 0;
  scx = 0;
  ly = 0;
  lyc = 0;
  bgp = 252;
  obp0 = 255;
  obp1 = 255;
  wy = 0;
  wx = 0;
  mode = 2;
  dot = 0;
  windowLine = 0;
  /** Palette index (pre-BGP) of each pixel on the current line, for sprite priority. */
  lineColours = new Uint8Array(SCREEN_WIDTH);
  /** Le bit de priorité de l'attribut, case par case — mode couleur seulement. */
  linePriorite = new Uint8Array(SCREEN_WIDTH);
  reset() {
    this.vram.fill(0);
    this.oam.fill(0);
    this.framebuffer.fill(0);
    this.couleurs.fill(NUANCES_DMG[0]);
    this.vbk = 0;
    this.bcps = 0;
    this.ocps = 0;
    /* Les palettes partent sur les quatre nuances d'origine — voir plus haut. */
    for (let palette = 0; palette < 8; palette++) {
      for (let teinte = 0; teinte < 4; teinte++) {
        const ou = palette * 8 + teinte * 2;
        this.bgPalettes[ou] = NUANCES_DMG[teinte] & 255;
        this.bgPalettes[ou + 1] = NUANCES_DMG[teinte] >> 8;
        this.objPalettes[ou] = NUANCES_DMG[teinte] & 255;
        this.objPalettes[ou + 1] = NUANCES_DMG[teinte] >> 8;
      }
    }
    this.lcdc = 145;
    this.stat = 0;
    this.scy = 0;
    this.scx = 0;
    this.ly = 0;
    this.lyc = 0;
    this.bgp = 252;
    this.obp0 = 255;
    this.obp1 = 255;
    this.wy = 0;
    this.wx = 0;
    this.mode = 2;
    this.dot = 0;
    this.windowLine = 0;
    this.frameReady = false;
  }
  /** Advances the PPU; returns the interrupt bits to raise. */
  step(cycles) {
    if ((this.lcdc & LCDC_ENABLE) === 0) {
      this.ly = 0;
      this.dot = 0;
      this.mode = 0;
      this.windowLine = 0;
      return 0;
    }
    let interrupts = 0;
    this.dot += cycles;
    for (; ; ) {
      if (this.mode === 2) {
        if (this.dot < OAM_SCAN_CYCLES) break;
        this.dot -= OAM_SCAN_CYCLES;
        this.mode = 3;
      } else if (this.mode === 3) {
        if (this.dot < DRAW_CYCLES) break;
        this.dot -= DRAW_CYCLES;
        this.mode = 0;
        this.renderScanline();
        if (this.stat & 8) interrupts |= STAT_INTERRUPT;
      } else if (this.mode === 0) {
        if (this.dot < HBLANK_CYCLES) break;
        this.dot -= HBLANK_CYCLES;
        this.ly++;
        interrupts |= this.checkCoincidence();
        if (this.ly === SCREEN_HEIGHT) {
          this.mode = 1;
          this.frameReady = true;
          interrupts |= VBLANK_INTERRUPT;
          if (this.stat & 16) interrupts |= STAT_INTERRUPT;
        } else {
          this.mode = 2;
          if (this.stat & 32) interrupts |= STAT_INTERRUPT;
        }
      } else {
        if (this.dot < LINE_CYCLES) break;
        this.dot -= LINE_CYCLES;
        this.ly++;
        if (this.ly > 153) {
          this.ly = 0;
          this.windowLine = 0;
          this.mode = 2;
          if (this.stat & 32) interrupts |= STAT_INTERRUPT;
        }
        interrupts |= this.checkCoincidence();
      }
    }
    return interrupts;
  }
  checkCoincidence() {
    if (this.ly === this.lyc && this.stat & 64) return STAT_INTERRUPT;
    return 0;
  }
  /* ----------------------------------------------------------- registers */
  read(address) {
    switch (address) {
      case 65344:
        return this.lcdc;
      case 65345:
        return this.stat | 128 | (this.ly === this.lyc ? 4 : 0) | this.mode;
      case 65346:
        return this.scy;
      case 65347:
        return this.scx;
      case 65348:
        return this.ly;
      case 65349:
        return this.lyc;
      case 65351:
        return this.bgp;
      case 65352:
        return this.obp0;
      case 65353:
        return this.obp1;
      case 65354:
        return this.wy;
      case 65355:
        return this.wx;
      case 65359:
        return this.vbk | 254;
      case 65384:
        return this.bcps;
      case 65385:
        return this.bgPalettes[this.bcps & 63];
      case 65386:
        return this.ocps;
      case 65387:
        return this.objPalettes[this.ocps & 63];
      default:
        return 255;
    }
  }
  write(address, value) {
    switch (address) {
      case 65344: {
        const wasOn = (this.lcdc & LCDC_ENABLE) !== 0;
        this.lcdc = value;
        if (wasOn && (value & LCDC_ENABLE) === 0) {
          this.ly = 0;
          this.dot = 0;
          this.mode = 0;
          this.framebuffer.fill(0);
        } else if (!wasOn && (value & LCDC_ENABLE) !== 0) {
          this.mode = 2;
          this.dot = 0;
        }
        break;
      }
      case 65345:
        this.stat = value & 120;
        break;
      case 65346:
        this.scy = value;
        break;
      case 65347:
        this.scx = value;
        break;
      case 65348:
        break;
      // LY is read-only
      case 65349:
        this.lyc = value;
        break;
      case 65351:
        this.bgp = value;
        break;
      case 65352:
        this.obp0 = value;
        break;
      case 65353:
        this.obp1 = value;
        break;
      case 65354:
        this.wy = value;
        break;
      case 65355:
        this.wx = value;
        break;
      /*
       * $FF4F — la banque de VRAM que le PROCESSEUR voit.
       *
       * Le rendu, lui, lit toujours les deux : la carte et les tuiles dans la
       * banque 0, les attributs dans la banque 1. Ce registre ne change que ce
       * que le programme atteint en écrivant en $8000-$9FFF.
       */
      case 65359:
        this.vbk = value & 1;
        break;
      /*
       * $FF68-$FF6B — les palettes.
       *
       * L'index porte un bit d'auto-incrément : posé une fois, on verse les
       * huit octets d'une palette d'affilée sans reposer l'index entre chaque.
       * C'est ce qui rend « couleurFond() » court dans la cartouche.
       */
      case 65384:
        this.bcps = value;
        break;
      case 65385:
        this.bgPalettes[this.bcps & 63] = value;
        if ((this.bcps & 128) !== 0) this.bcps = this.bcps & 192 | this.bcps + 1 & 63;
        break;
      case 65386:
        this.ocps = value;
        break;
      case 65387:
        this.objPalettes[this.ocps & 63] = value;
        if ((this.ocps & 128) !== 0) this.ocps = this.ocps & 192 | this.ocps + 1 & 63;
        break;
    }
  }
  /* ------------------------------------------------------------ rendering */
  renderScanline() {
    const line = this.ly;
    if (line >= SCREEN_HEIGHT) return;
    const rowStart = line * SCREEN_WIDTH;
    if ((this.lcdc & LCDC_BG_ENABLE) === 0) {
      this.framebuffer.fill(0, rowStart, rowStart + SCREEN_WIDTH);
      this.couleurs.fill(
        this.couleur ? this.couleurDe(this.bgPalettes, 0, 0) : NUANCES_DMG[0],
        rowStart,
        rowStart + SCREEN_WIDTH
      );
      this.lineColours.fill(0);
      this.linePriorite.fill(0);
    } else {
      this.renderBackground(line, rowStart);
      if ((this.lcdc & LCDC_WINDOW_ENABLE) !== 0) this.renderWindow(line, rowStart);
    }
    if ((this.lcdc & LCDC_OBJ_ENABLE) !== 0) this.renderSprites(line, rowStart);
  }
  /** La couleur d'une teinte, dans une palette de fond ou de lutin. */
  couleurDe(palettes, palette, teinte) {
    const ou = (palette & 7) * 8 + (teinte & 3) * 2;
    return palettes[ou] | palettes[ou + 1] << 8;
  }
  renderBackground(line, rowStart) {
    const mapBase = (this.lcdc & LCDC_BG_MAP_HIGH) !== 0 ? 7168 : 6144;
    const y = line + this.scy & 255;
    const tileRow = y >> 3;
    const pixelRow = y & 7;
    for (let x = 0; x < SCREEN_WIDTH; x++) {
      const mapX = x + this.scx & 255;
      const ouCarte = mapBase + tileRow * 32 + (mapX >> 3);
      const tileIndex = this.vram[ouCarte];
      /* L'attribut vit à la MÊME adresse, dans la seconde banque. */
      const attribut = this.couleur ? this.vram[8192 + ouCarte] : 0;
      const colour = this.tilePixelCgb(tileIndex, pixelRow, mapX & 7, attribut);
      this.lineColours[x] = colour;
      this.linePriorite[x] = attribut >> 7 & 1;
      this.peindreFond(rowStart + x, colour, attribut);
    }
  }
  /** Le fond : la palette vient de l'attribut en couleur, de BGP sinon. */
  peindreFond(ou, teinte, attribut) {
    if (this.couleur) {
      this.framebuffer[ou] = teinte;
      this.couleurs[ou] = this.couleurDe(this.bgPalettes, attribut & 7, teinte);
      return;
    }
    const nuance = this.bgp >> teinte * 2 & 3;
    this.framebuffer[ou] = nuance;
    this.couleurs[ou] = NUANCES_DMG[nuance];
  }
  /*
   * Un pixel de tuile, attribut compris.
   *
   * En mode couleur l'attribut dit la banque où lire la tuile, et si elle est
   * retournée. En mode d'origine il vaut zéro, et l'on retombe exactement sur
   * l'ancien calcul — c'est ce qui permet aux deux modes de partager ce code
   * sans que le premier change d'un cycle.
   */
  tilePixelCgb(tileIndex, row, column, attribut) {
    const banque = this.couleur ? (attribut >> 3 & 1) * 8192 : 0;
    const ligne = this.couleur && (attribut & 64) !== 0 ? 7 - row : row;
    const colonne = this.couleur && (attribut & 32) !== 0 ? 7 - column : column;
    let address;
    if ((this.lcdc & LCDC_TILE_DATA_LOW) !== 0) {
      address = tileIndex * 16;
    } else {
      address = 4096 + (tileIndex << 24 >> 24) * 16;
    }
    address += ligne * 2;
    const low = this.vram[banque + address];
    const high = this.vram[banque + address + 1];
    const bit = 7 - colonne;
    return (high >> bit & 1) << 1 | low >> bit & 1;
  }
  renderWindow(line, rowStart) {
    if (line < this.wy) return;
    const startX = this.wx - 7;
    if (startX >= SCREEN_WIDTH) return;
    const mapBase = (this.lcdc & LCDC_WINDOW_MAP_HIGH) !== 0 ? 7168 : 6144;
    const y = this.windowLine;
    const tileRow = y >> 3 & 31;
    const pixelRow = y & 7;
    for (let x = Math.max(0, startX); x < SCREEN_WIDTH; x++) {
      const windowX = x - startX;
      const ouCarte = mapBase + tileRow * 32 + (windowX >> 3 & 31);
      const tileIndex = this.vram[ouCarte];
      const attribut = this.couleur ? this.vram[8192 + ouCarte] : 0;
      const colour = this.tilePixelCgb(tileIndex, pixelRow, windowX & 7, attribut);
      this.lineColours[x] = colour;
      this.linePriorite[x] = attribut >> 7 & 1;
      this.peindreFond(rowStart + x, colour, attribut);
    }
    this.windowLine++;
  }
  /** Reads one pixel out of a background/window tile, honouring the LCDC addressing mode. */
  tilePixel(tileIndex, row, column) {
    let address;
    if ((this.lcdc & LCDC_TILE_DATA_LOW) !== 0) {
      address = tileIndex * 16;
    } else {
      address = 4096 + (tileIndex << 24 >> 24) * 16;
    }
    address += row * 2;
    const low = this.vram[address];
    const high = this.vram[address + 1];
    const bit = 7 - column;
    return (high >> bit & 1) << 1 | low >> bit & 1;
  }
  renderSprites(line, rowStart) {
    const height = (this.lcdc & LCDC_OBJ_TALL) !== 0 ? 16 : 8;
    const visible = [];
    for (let index = 0; index < 40 && visible.length < MAX_SPRITES_PER_LINE; index++) {
      const spriteY = this.oam[index * 4] - 16;
      if (line >= spriteY && line < spriteY + height) visible.push(index);
    }
    visible.sort((a, b) => this.oam[b * 4 + 1] - this.oam[a * 4 + 1] || b - a);
    for (const index of visible) {
      const spriteY = this.oam[index * 4] - 16;
      const spriteX = this.oam[index * 4 + 1] - 8;
      const flags = this.oam[index * 4 + 3];
      const behindBackground = (flags & 128) !== 0;
      const flipY = (flags & 64) !== 0;
      const flipX = (flags & 32) !== 0;
      /* En couleur, la palette est un numéro de 0 à 7 pris dans les trois bits
         du bas, et la tuile peut vivre dans la seconde banque. */
      const palette = (flags & 16) !== 0 ? this.obp1 : this.obp0;
      const paletteCgb = flags & 7;
      const banque = this.couleur ? (flags >> 3 & 1) * 8192 : 0;
      let tileIndex = this.oam[index * 4 + 2];
      if (height === 16) tileIndex &= 254;
      let row = line - spriteY;
      if (flipY) row = height - 1 - row;
      const address = tileIndex * 16 + row * 2;
      const low = this.vram[banque + address];
      const high = this.vram[banque + address + 1];
      for (let x = 0; x < 8; x++) {
        const screenX = spriteX + x;
        if (screenX < 0 || screenX >= SCREEN_WIDTH) continue;
        const bit = flipX ? x : 7 - x;
        const colour = (high >> bit & 1) << 1 | low >> bit & 1;
        if (colour === 0) continue;
        /* Deux priorités en couleur : celle du lutin, et celle de la case du
           fond. L'une ou l'autre suffit à faire passer le décor devant. */
        if (behindBackground && this.lineColours[screenX] !== 0) continue;
        if (this.couleur && this.linePriorite[screenX] && this.lineColours[screenX] !== 0) continue;
        if (this.couleur) {
          this.framebuffer[rowStart + screenX] = colour;
          this.couleurs[rowStart + screenX] = this.couleurDe(this.objPalettes, paletteCgb, colour);
        } else {
          const nuance = palette >> colour * 2 & 3;
          this.framebuffer[rowStart + screenX] = nuance;
          this.couleurs[rowStart + screenX] = NUANCES_DMG[nuance];
        }
      }
    }
  }
};

// src/core/emu/class/Timer.ts
var TAC_PERIODS = [1024, 16, 64, 256];
var Timer = class {
  divider = 0;
  counter = 0;
  // TIMA
  modulo = 0;
  // TMA
  control = 0;
  // TAC
  tick = 0;
  reset() {
    this.divider = 43980;
    this.counter = 0;
    this.modulo = 0;
    this.control = 0;
    this.tick = 0;
  }
  /** Advances by `cycles` T-cycles; returns the interrupt bits to raise. */
  step(cycles) {
    this.divider = this.divider + cycles & 65535;
    if ((this.control & 4) === 0) return 0;
    let interrupts = 0;
    const period = TAC_PERIODS[this.control & 3];
    this.tick += cycles;
    while (this.tick >= period) {
      this.tick -= period;
      this.counter++;
      if (this.counter > 255) {
        this.counter = this.modulo;
        interrupts |= TIMER_INTERRUPT;
      }
    }
    return interrupts;
  }
  read(address) {
    switch (address) {
      case 65284:
        return this.divider >> 8 & 255;
      case 65285:
        return this.counter;
      case 65286:
        return this.modulo;
      case 65287:
        return this.control | 248;
      default:
        return 255;
    }
  }
  write(address, value) {
    switch (address) {
      case 65284:
        this.divider = 0;
        this.tick = 0;
        break;
      case 65285:
        this.counter = value & 255;
        break;
      case 65286:
        this.modulo = value & 255;
        break;
      case 65287:
        this.control = value & 7;
        break;
    }
  }
};

// src/core/emu/class/GameBoy.ts
var GameBoy = class {
  apu = new Apu();
  ppu = new Ppu();
  timer = new Timer();
  joypad = new Joypad();
  mmu = new Mmu(this.ppu, this.timer, this.joypad, this.apu);
  cpu = new Cpu(this.mmu);
  /** Cycles carried over from the previous frame. */
  carry = 0;
  loadRom(rom) {
    this.mmu.loadRom(rom);
    this.reset();
  }
  reset() {
    this.apu.reset();
    this.ppu.reset();
    this.timer.reset();
    this.joypad.reset();
    this.mmu.reset();
    this.cpu.reset();
    this.carry = 0;
  }
  setButton(button, isDown) {
    this.joypad.setPressed(button, isDown);
  }
  releaseAllButtons() {
    this.joypad.releaseAll();
  }
  /** Runs one instruction and advances the other chips by the cycles it took. */
  stepInstruction() {
    const cycles = this.cpu.step();
    this.apu.step(cycles);
    this.mmu.requestInterrupt(this.ppu.step(cycles));
    this.mmu.requestInterrupt(this.timer.step(cycles));
    return cycles;
  }
  /**
   * Advances until the PPU finishes a frame. Falls back to a cycle budget so a
   * ROM stuck in a loop with the LCD off cannot hang the browser tab.
   */
  runFrame() {
    this.ppu.frameReady = false;
    let cycles = this.carry;
    while (!this.ppu.frameReady && cycles < CYCLES_PER_FRAME * 2) {
      cycles += this.stepInstruction();
    }
    this.carry = this.ppu.frameReady ? Math.max(0, cycles - CYCLES_PER_FRAME) : 0;
    return this.ppu.framebuffer;
  }
  get framebuffer() {
    return this.ppu.framebuffer;
  }
};
export {
  Apu,
  CYCLES_PER_FRAME,
  Cpu,
  GameBoy,
  Joypad,
  Mmu,
  Ppu,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  Timer
};
