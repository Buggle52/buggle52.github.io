class HardwareSynth {
  constructor(output) {
      this.output = output;
      //this.#Initialise();
  }

  #Initialise() {
    //Select Init Performance
    this.output.sendControlChange(0, 64);
    this.output.sendControlChange(32, 31);
    this.output.sendProgramChange(124);

    //Switch off reverb
    this.PerfReverb(0);

    //Switch on mono
    this.PartMonoPoly(0, 0);

    //Set up part LFO
    this.PartLFODestination(0, 0, 65);
    this.PartLFODestination(0, 1, 66);

    //Set up Filter
    this.ElementFilterType(0, 0, 1);
    this.ElementFilterType(0, 1, 1);
    this.ElementFilterType(0, 2, 1);
    this.ElementFilterType(0, 7, 1);

    //Set up part control
    this.PartMod(0, 0, 1, 59, 2, 1, 0, 3, 2);
    this.PartMod(0, 1, 1, 59, 3, 1, 127, 5, 2);
    this.PartMod(0, 2, 1, 59, 2, 1, 127, 7, 2);
    this.PartModElementSwitch(0, 0, {0:1});
    this.PartModElementSwitch(0, 1, {1:1});
    this.PartModElementSwitch(0, 2, {2:1});
  }

  PerformanceChange(bank1, bank2, program) {
    this.output.sendControlChange(0, bank1);
    this.output.sendControlChange(32, bank2);
    this.output.sendProgramChange(program);
  }

  PerformanceName(name) {
    for (var i=0; i<name.length; i++)
      this.#SendSysex([0x30, 0x40, 0x00 + i, name.charCodeAt(i)]);
    for (var i=name.length; i<20; i++)
      this.#SendSysex([0x30, 0x40, 0x00 + i, 0x00]);
  }

  PartName(partId, name) {
    var ep = this.#ConvertP(partId);

    for (var i=0; i<name.length; i++)
      this.#SendSysex([0x31, ep, 0x00 + i, name.charCodeAt(i)]);
    for (var i=name.length; i<20; i++)
      this.#SendSysex([0x31, ep, 0x00 + i, 0x00]);
  }

  PartSwitch(partId, value) {
    var ep = this.#ConvertP(partId);
    this.#SendSysex([0x31, ep, 0x16, value]);
  }

  PartMonoPoly(partId, value) {
    var ep = this.#ConvertP(partId);

    this.#SendSysex([0x31, ep, 0x36, value]);
  }

  PartPortamento(partId, pswitch, ptime, pmode, ptimemode) {
    var ep = this.#ConvertP(partId);

    this.#SendSysex([0x31, ep, 0x31, pswitch]);
    this.#SendSysex([0x31, ep, 0x32, ptime]);
    this.#SendSysex([0x31, ep, 0x33, pmode]);
    this.#SendSysex([0x31, ep, 0x34, ptimemode]);
  }

  PartLevel(partId, level) {
    var ep = this.#ConvertP(partId);

    this.#SendSysex([0x31, ep, 0x24, level]);
  }

  PartLFODestination(partId, dest, value) {
    var ep = this.#ConvertEP(partId, 4);
    //64 = Level
    //65 = Pitch
    //66 = Filter

    var d;
    switch (dest) {
      case 0: //Destination 1
        d = 0x0B;
        break;
      case 1: //Destination 2
        d = 0x0E;
        break;
      case 2: //Destination 3
        d = 0x11;
        break;
    }

    this.#SendSysex([0x31, ep, d, value]);
  }

  PartLFODepth(partId, dest, value) {
    var ep = this.#ConvertEP(partId, 4);

    var d;
    switch (dest) {
      case 0: //Destination 1
        d = 0x0C;
        break;
      case 1: //Destination 2
        d = 0x0F;
        break;
      case 2: //Destination 3
        d = 0x12;
        break;
    }

    this.#SendSysex([0x31, ep, d, value]);
  }

  PartLFOSpeed(partId, value) {
    var ep = this.#ConvertEP(partId, 4);
    this.#SendSysex([0x31, ep, 0x02, value]);
  }

  PartLFOElementDepth(partId, elementId, lfoId, value) {
    let ep = this.#ConvertEP(partId, elementId);
    this.#SendSysex([0x42, ep, 0x43 + lfoId, value]); //LFO ID = 0-2
  }

  PartMod(partId, modId, msource, mdest, mcurve, mpolarity, mratio, mparam1, mparam2) {
    var p = this.#ConvertP(partId);

    //ModId should be 0-15
    var m = modId * 9;

    this.#SendSysex([0x38, p, m, msource]);
    this.#SendSysex([0x38, p, m+1, 0x00, mdest]);
    this.#SendSysex([0x38, p, m+3, 0x00]); //Curve Bank Preset
    this.#SendSysex([0x38, p, m+4, mcurve]);
    this.#SendSysex([0x38, p, m+7, mpolarity]);
    this.#SendSysex([0x38, p, m+8, mratio]);
    this.#SendSysex([0x38, p, m+5, mparam1]);
    this.#SendSysex([0x38, p, m+6, mparam2]);
  }

  PartModElementSwitch(partId, elementId, modArray) {
    //elementArray should be 0-15 indexes each containing null/0 or 1

    //15 14   13 12 11 10 09 08 07   06 05 04 03 02 01 00
    // 0  0    0  0  0  0  0  0  0    0  0  0  0  0  0  0   = 0 (None)
    // 0  0    0  0  0  0  0  0  0    0  0  0  0  0  0  1   = 1
    // 0  0    0  0  0  0  0  0  0    0  0  0  0  0  1  0   = 2

   //Populate all indexes and chunk
   let e = [];
   for (var i=0; i<16; i++) {
     e[i] = (modArray[i] == 1 ? 1 : 0);
   }
   let v1 = parseInt(e.slice(0, 6).reverse().join(""), 2);
   let v2 = parseInt(e.slice(7, 13).reverse().join(""), 2);
   let v3 = parseInt(e.slice(14, 15).reverse().join(""), 2);

   let ep = this.#ConvertEP(partId, elementId);
   this.#SendSysex([0x41, ep, 0x19, 0x00, 0x00, v3, v2, v1]);
  }

  PartKnobChange(partId, controller, value) {
    //controller = 0-7

    var ep = this.#ConvertP(partId);
    this.#SendSysex([0x31, ep, 0x6A + controller, value]);
  }

  PartEffect(partId, eId, eTypeMSB, eTypeLSB, eParams)
  {
    //Insert A = 0, Insert B = 1
    var ep;
    if (eId == 0)
      ep = this.#ConvertEP(partId, 2);
    else
      ep = this.#ConvertEP(partId, 3);

    this.#SendSysex([0x31, ep, 0x00, eTypeMSB, eTypeLSB]);
    //Pass parameters as [[n,v], [n,v]...]

    for (var p in eParams) {
      var pNum = eParams[p][0];
      var pVal = eParams[p][1];
      this.#SendSysex([0x31, ep, 0x01 + (pNum*2), 0x00, pVal]); //Params go into LSB
    }
  }

  PartReverb(partId, value) {
    var ep = this.#ConvertP(partId);
    this.#SendSysex([0x31, ep, 0x29, value]);
  }

  ElementOnOff(partId, elementId, value) {
    var ep = this.#ConvertEP(partId, elementId);

    this.#SendSysex([0x41, ep, 0x00, value]);
  }

  ElementWaveform(partId, elementId, value) {
    var ep = this.#ConvertEP(partId, elementId);
    var msb = (value >> 7) & 0x7F;
    var lsb = value & 0x7F;

    this.#SendSysex([0x41, ep, 0x03, msb, lsb]);
  }

  ElementFineTune(partId, elementId, level) {
    var ep = this.#ConvertEP(partId, elementId);

    this.#SendSysex([0x41, ep, 0x4A, level]);
  }

  ElementCourseTune(partId, elementId, level) {
    var ep = this.#ConvertEP(partId, elementId);

    this.#SendSysex([0x41, ep, 0x49, level]);
  }

  ElementLevel(partId, elementId, level) {
    var ep = this.#ConvertEP(partId, elementId);

    this.#SendSysex([0x41, ep, 0x28, level]);
  }

  ElementEQ(partId, elementId, eqType, eq2Gain) {
    var ep = this.#ConvertEP(partId, elementId);

    this.#SendSysex([0x42, ep, 0x32, eqType]);
    if (eq2Gain != null) this.#SendSysex([0x42, ep, 0x39, eq2Gain]);
  }

  ElementPan(partId, elementId, level) {
    var ep = this.#ConvertEP(partId, elementId);

    this.#SendSysex([0x41, ep, 0x08, level]);
  }

  ElementEnvAttack(partId, elementId, value) {
    var ep = this.#ConvertEP(partId, elementId);

    this.#SendSysex([0x41, ep, 0x32, 0x00]); //Initial level
    this.#SendSysex([0x41, ep, 0x2D, value]); //Attack time (Attack)
    this.#SendSysex([0x41, ep, 0x33, 0x7F]); //Attack level
  }

  ElementEnvDecay(partId, elementId, value) {
    var ep = this.#ConvertEP(partId, elementId);

    this.#SendSysex([0x41, ep, 0x2E, 0x00]); //Decay1 time
    this.#SendSysex([0x41, ep, 0x34, 0x7F]); //Decay1 level
    this.#SendSysex([0x41, ep, 0x2F, value]); //Decay2 time (Decay)
  }

  ElementEnvSustain(partId, elementId, value) {
    var ep = this.#ConvertEP(partId, elementId);

    this.#SendSysex([0x41, ep, 0x35, value]); //Decay2 level (Sustain)
  }

  ElementEnvRelease(partId, elementId, value) {
    var ep = this.#ConvertEP(partId, elementId);

    this.#SendSysex([0x41, ep, 0x31, value]); //Release time (Release)
}

  ElementLFOSpeed(partId, elementId, value) {
    var ep = this.#ConvertEP(partId, elementId);

    this.#SendSysex([0x42, ep, 0x3D, value]);
  }

  ElementLFOPitchDepth(partId, elementId, value) {
    var ep = this.#ConvertEP(partId, elementId);

    this.#SendSysex([0x42, ep, 0x3F, value]);
  }

  ElementLFOFilterDepth(partId, elementId, value) {
    var ep = this.#ConvertEP(partId, elementId);

    this.#SendSysex([0x42, ep, 0x40, value]);
  }

  ElementFilterType(partId, elementId, value) {
    var ep = this.#ConvertEP(partId, elementId);
    this.#SendSysex([0x42, ep, 0x00, value]);
  }

  ElementFilterCutoff(partId, elementId, value) {
    var ep = this.#ConvertEP(partId, elementId);
    var msb = (value >> 7) & 0x7F;
    var lsb = value & 0x7F;

    this.#SendSysex([0x42, ep, 0x01, msb, lsb]);
  }

  ElementFilterResonance(partId, elementId, value) {
    var ep = this.#ConvertEP(partId, elementId);
    this.#SendSysex([0x42, ep, 0x05, value]);
  }

  ElementFilterEnvDepth(partId, elementId, value) {
    var ep = this.#ConvertEP(partId, elementId);
    this.#SendSysex([0x42, ep, 0x1D, value]);
  }

  ElementFilterEnvAttack(partId, elementId, value) {
    var ep = this.#ConvertEP(partId, elementId);

    this.#SendSysex([0x42, ep, 0x0E, 0x00]); //Hold time
    this.#SendSysex([0x42, ep, 0x13,  0x01, 0x00]); //Hold level
    this.#SendSysex([0x42, ep, 0x0F, value]); //Attack time (Attack)
    this.#SendSysex([0x42, ep, 0x15, 0x01, 0x7F]); //Attack level
  }

  ElementFilterEnvDecay(partId, elementId, value) {
    var ep = this.#ConvertEP(partId, elementId);

    this.#SendSysex([0x42, ep, 0x10, 0x00]); //Decay1 time
    this.#SendSysex([0x42, ep, 0x17, 0x01, 0x7F]); //Decay2 level
    this.#SendSysex([0x42, ep, 0x11, value]); //Decay2 time (Decay)
  }

  ElementFilterEnvSustain(partId, elementId, value) {
    var ep = this.#ConvertEP(partId, elementId);

    this.#SendSysex([0x42, ep, 0x19, 0x01, value]); //Decay2 level (Sustain)
  }

  ElementFilterEnvRelease(partId, elementId, value) {
    var ep = this.#ConvertEP(partId, elementId);

    this.#SendSysex([0x42, ep, 0x12, value]); //Release time (Release)
    this.#SendSysex([0x42, ep, 0x1B, 0x01, 0x00]); //Release level
  }

  #SendSysex(message) {
    var msg = [0x10, 0x7F, 0x1C, 0x07];
    msg = msg.concat(message);

    this.output.sendSysex(0x43, msg);

    //document.getElementById("debug").innerHTML = this.#toHexString(msg);
  }

  #toHexString(byteArray) {
    return Array.from(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('-')
  }

  #SendCC(cc, value) {
    this.output.sendControlChange(cc, value, [1]);
  }

  #ConvertP(partId) {
    var ep = parseInt("0x0" + partId, 16);
    return ep;
  }

  #ConvertEP(partId, elementId) {
    var ep = parseInt("0x" + elementId + partId, 16);
    return ep;
  }
}

/*
----MONTAGE/MODX SYSEX COMMANDS----
Data List: https://usa.yamaha.com/files/download/other_assets/2/1192592/modx_en_dl_d0.pdf

--HEADER--
Manufacturer Identifier:
Yamaha = 0x43
Device Number = 0x1n (expect 0)
Group ID High = 0x7F
Group ID Low = 0x1C
Model ID = MONTAGE 0x01, MODX 0x07
*/
