class VirtualSynth {
  /*bgSource = "";
  bgWidth = "";
  bgHeight = "";
  //controls = [];*/

  constructor() {
    Part = 0;
  }

  SetupPerformance() {
    //Select Init Performance
    Synth.PerformanceChange(64, 31, 124);
  }

  SetupPart(partId) {
    Part = partId;

    Synth.PartSwitch(Part, 1);

    //Switch on mono
    Synth.PartMonoPoly(Part, 0);

    //Set up part LFO
    Synth.PartLFODestination(Part, 0, 65); //Pitch
    Synth.PartLFODestination(Part, 1, 66); //Cutoff
    Synth.PartLFODestination(Part, 2, 64); //Level (PWM only)

    //Set up LFO element depths...
    for (var i=0; i<8; i++) {
      Synth.PartLFOElementDepth(Part, i, 0, 127);
      Synth.PartLFOElementDepth(Part, i, 1, 127);
      Synth.PartLFOElementDepth(Part, i, 2, 0);
    }
    Synth.PartLFOElementDepth(Part, 5, 2, 127); //Just the PRM

    //Set up Filter
    for (var i=0; i<8; i++)
      Synth.ElementFilterType(Part, i, 1);

    //Set up voices
    Synth.ElementWaveform(Part, 0, 2117); //Elem1 = Saw
    Synth.ElementWaveform(Part, 1, 2136); //Elem2 = Square
    Synth.ElementWaveform(Part, 2, 2136); //Elem3 = PW 50%
    Synth.ElementWaveform(Part, 3, 2134); //Elem3 = PW 25%
    Synth.ElementWaveform(Part, 4, 2131); //Elem3 = PW 10%
    Synth.ElementWaveform(Part, 5, 2084); //Elem3 = PWM (2083)
    Synth.ElementWaveform(Part, 6, 2572); //White
    Synth.ElementWaveform(Part, 7, 2573); //Pink

    //Tweak PWM
    Synth.ElementEQ(Part, 5, 2); //EQ Boost6
    Synth.ElementLFOSpeed(Part, 5, 32); //Elem LFO
    Synth.ElementLFOPitchDepth(Part, 5, 42); //Elem LFO

    //Tweak Noise
    Synth.ElementEQ(Part, 6, 0, 0x20); //-2db hi
    Synth.ElementEQ(Part, 7, 0, 0x20); //-2db hi

    //Set up part control (PWM only)
    Synth.PartMod(Part, 0, 8, 59, 4,  0, 0, 10, 4);
    Synth.PartMod(Part, 1, 8, 59, 10, 0, 36, 12, 0);
    Synth.PartMod(Part, 2, 8, 59, 4,  0, 32, 0, 1);

    //Set up mod element switches
    for (var i=0; i<8; i++) {
      if (i == 2) Synth.PartModElementSwitch(Part, i, {0:1});
      else if (i == 3) Synth.PartModElementSwitch(Part, i, {1:1});
      else if (i == 4) Synth.PartModElementSwitch(Part, i, {2:1});
      else Synth.PartModElementSwitch(Part, i, {});
    }

    //Switch off reverb
    Synth.PartReverb(Part, 0);
  }

  DrawBackground(parentElement)
  {
      var bg = document.createElement("img");
      bg.style = "position:absolute; top:0px; left:0px; border:none; border-radius:0;"; //filter: blur(2px);
      bg.setAttribute("width", "100%"); //1500px
      //bg.setAttribute("height", "600px"); //600px
      bg.setAttribute("src", "Background_Full.svg");
      parentElement.appendChild(bg);
  }

  AddControls() {
    this.controls = [];
    //constructor(name, left, top, valMin, valMax, valStep, valInitial, angleStart, angleSweep, onChangeFunction)
    this.controls.push(new VirtualKnob("Tune", 30, 19, 0, 127, 1, 64, -155, 310, GenX_Tune));
    this.controls.push(new VirtualKnob("Octave", 90, 19, -1, 2, 1, 0, -43, 86, GenX_Octave));
    this.controls.push(new VirtualKnob("Vibrato", 150, 19, 0, 52, 1, 0, -155, 310, GenX_Vibrato));
    this.controls.push(new VirtualKnob("LFOSpeed", 210, 19, 14, 63, 1, 38, -155, 310, GenX_LFOSpeed));
    this.controls.push(new VirtualKnob("Frequency", 270, 19, 100, 200, 1, 150, -155, 310, GenX_Frequency));
    this.controls.push(new VirtualKnob("Resonance", 330, 19, 0, 127, 1, 0, -155, 310, GenX_Resonance));
    this.controls.push(new VirtualKnob("LFOAmount", 390, 19, 0, 60, 1, 0, -155, 310, GenX_LFOAmount));
    //this.controls.push(new VirtualKnob("EnvLevel", 450, 19, 90, 115, 1, 105, -155, 310, GenX_EnvLevel)); //64=0, 127=100%
    this.controls.push(new VirtualKnob("EnvLevel", 450, 19, 64, 115, 1, 105, -155, 310, GenX_EnvLevel)); //64=0, 127=100%
    this.controls.push(new VirtualKnob("Waveform", 30, 71, 0, 2, 1, 0, -28, 56, GenX_Waveform));
    this.controls.push(new VirtualKnob("PWMWidth", 90, 71, 0, 127, 1, 127, -134, 268, GenX_PWMWidth));
    this.controls.push(new VirtualKnob("PWMAmount", 150, 71, 0, 127, 1, 0, -155, 310, GenX_PWMAmount));
    this.controls.push(new VirtualKnob("VCOLevel", 210, 71, 0, 127, 1, 100, -155, 310, GenX_VCOLevel));
    this.controls.push(new VirtualKnob("VCFAttack", 270, 71, 10, 85, 1, 0, -155, 310, GenX_VCFAttack));
    this.controls.push(new VirtualKnob("VCFDecay", 330, 71, 45, 115, 1, 45, -155, 310, GenX_VCFDecay));
    this.controls.push(new VirtualKnob("VCFSustain", 390, 71, 0, 127, 1, 127, -155, 310, GenX_VCFSustain));
    this.controls.push(new VirtualKnob("VCFRelease", 450, 71, 35, 115, 1, 50, -155, 310, GenX_VCFRelease));
    this.controls.push(new VirtualKnob("Glide", 30, 123, 0, 96, 1, 0, -155, 310, GenX_Glide));
    this.controls.push(new VirtualKnob("NoiseType", 90, 123, 0, 2, 1, 0, -28, 56, GenX_NoiseType));
    this.controls.push(new VirtualKnob("NoiseLevel", 150, 123, 0, 127, 1, 0, -155, 310, GenX_NoiseLevel));
    this.controls.push(new VirtualKnob("Volume", 210, 123, 0, 127, 1, 100, -155, 310, GenX_Volume));
    this.controls.push(new VirtualKnob("VCAAttack", 270, 123, 35, 110, 1, 0, -155, 310, GenX_VCAAttack));
    this.controls.push(new VirtualKnob("VCADecay", 330, 123, 45, 115, 1, 45, -155, 310, GenX_VCADecay));
    this.controls.push(new VirtualKnob("VCASustain", 390, 123, 0, 127, 1, 127, -155, 310, GenX_VCASustain));
    this.controls.push(new VirtualKnob("VCARelease", 450, 123, 35, 115, 1, 50, -155, 310, GenX_VCARelease));

    this.controls.push(new VirtualSwitch("Chorus", 464, 169, false, GenX_Chorus));
    this.controls.push(new VirtualSwitch("Sub", 434, 169, false, GenX_Sub));
    this.controls.push(new VirtualSwitch("Poly", 404, 169, false, GenX_Poly));
  }

  DrawControls(parentElement) {
    for (var c in this.controls) {
        this.controls[c].Draw(parentElement, c);
    }
  }

  SetControls() {
    for (var c in this.controls) {
      this.controls[c].onChange(this.controls[c].valInitial);
    }
  }

  GetControl(name) {
    return this.controls.find(c => c.name == name);
  }

  onControlChange(controlId, value) {
      this.controls[controlId].onChange(value);
  }
}

class VirtualControl {
  constructor(name, top, left, onChangeFunction) {
    this.name = name;
    this.top = top;
    this.left = left;
    this.onChangeFunction = onChangeFunction;
  }

  Draw(parentElement, id) {}

  onChange(value) {
      this.onChangeFunction(value);
  }
}

class VirtualKnob extends VirtualControl {
  constructor(name, left, top, valMin, valMax, valStep, valInitial, angleStart, angleSweep, onChangeFunction)
  {
    super(name, top, left, onChangeFunction);
    this.valMin = valMin;
    this.valMax = valMax;
    this.valStep = valStep;
    this.valInitial = valInitial;
    this.angleStart = angleStart;
    this.angleSweep = angleSweep;
    this.valCurrent = valInitial;
  }

  Draw(parentElement, id) {
    var x = this.left;
    var y = this.top;

    //var x = (this.left * uiScale); document.getElementById("debug").innerHTML = x;
    //var y = (this.top * uiScale);

    var input = document.createElement("input");
    input.style.position = "absolute";
    input.style.left = x + "px";
    input.style.top = y + "px";
    input.setAttribute("type", "range");
    input.setAttribute("min", this.valMin);
    input.setAttribute("max", this.valMax);
    input.setAttribute("value", this.valInitial);
    input.setAttribute("step", this.valStep);
    input.setAttribute("class", "input-knob");
    input.setAttribute("data-width", "28");
    input.setAttribute("data-height", "28");
    input.setAttribute("angle-start", this.angleStart||-155);
    input.setAttribute("angle-sweep", this.angleSweep||310);
    input.setAttribute("data-src", "./KnobMv.svg");
    input.setAttribute("oninput", "onControlChange(" + id + ", this.value)");
    parentElement.appendChild(input);
  }
}

class VirtualSwitch extends VirtualControl {
  constructor(name, left, top, valInitial, onChangeFunction)
  {
    super(name, top, left, onChangeFunction);
    //this.top -= 3;
    //this.left -= 4;
    this.valInitial = valInitial;
    this.valCurrent = valInitial;
  }

  Draw(parentElement, id) {
    var x = this.left;
    var y = this.top;

    //var x = (this.left * uiScale); document.getElementById("debug").innerHTML = x;
    //var y = (this.top * uiScale);

    var input = document.createElement("input");
    input.style.position = "absolute";
    input.style.left = x + "px";
    input.style.top = y + "px";
    input.setAttribute("type", "checkbox");
    input.checked = (this.valInitial ? true : false);
    input.setAttribute("class", "input-switch");
    input.setAttribute("data-diameter", "20");
    input.setAttribute("data-src", "./SwitchMv_OnOff.svg");
    input.setAttribute("oninput", "onControlChange(" + id + ", this.checked)");
    parentElement.appendChild(input);
  }
}

function GenX_DoNothing(value) {

}

function GenX_Tune(value) {
  var f, c; //TODO = Allow for 1 tone change
  for (var i=0; i<6; i++) //Not noise elements
    Synth.ElementFineTune(Part, i, value);
}

function GenX_Octave(value) {
  var tune = 64 + (value-1) * 12;

  for (var i=0; i<6; i++)  //Not noise elements
    Synth.ElementCourseTune(Part, i, tune);

  //Noise elements stay at fixed levels
  Synth.ElementCourseTune(Part, 6, 76); //+1 oct
  Synth.ElementCourseTune(Part, 7, 88); //+2 oct
}

function GenX_Waveform(value) {
  let e = [];

  switch (parseInt(value)) {
    case 0: //Saw
      e = [1,0,0,0,0,0];
      break;
    case 1: //Square
      e = [0,1,0,0,0,0];
      break;
    case 2: //PW
      e = [0,0,1,1,1,1];
      break;
  }

  for (var i=0; i<6; i++) //Not noise elements
    Synth.ElementOnOff(Part, i, e[i]);
}

function GenX_VCOLevel(value) {
  for (var i=0; i<6; i++) //Not noise elements
    Synth.ElementLevel(Part, i, value);
}

function GenX_Glide(value) {
  var sw = 0;
  var ti = 0;
  var mo = 1;
  var tm = 0; //Time1

  if (value > 0) {
    sw = 1;
    ti = value;
  }

  Synth.PartPortamento(Part, sw, ti, mo, tm);
}

function GenX_NoiseType(value) {
  let e = [];

  switch (parseInt(value)) {
    case 0: //Off
      e = [0,0];
      break;
    case 1: //White
      e = [1,0];
      break;
    case 2: //Pink
      e = [0,1];
      break;
  }

  Synth.ElementOnOff(Part, 6, e[0]);
  Synth.ElementOnOff(Part, 7, e[1]);
}

function GenX_NoiseLevel(value) {
  var on = 0;

  Synth.ElementLevel(Part, 6, value);
  Synth.ElementLevel(Part, 7, value);
}

function GenX_Volume(value) {
  Synth.PartLevel(Part, value);
}

function GenX_LFOSpeed(value) {
  //Synth.ElementLFOSpeed(0, 0, value);
  //Synth.ElementLFOSpeed(0, 7, value);
  Synth.PartLFOSpeed(Part, value);
}

function GenX_Vibrato(value) {
  //Synth.ElementLFOPitchDepth(0, 0, value);
  Synth.PartLFODepth(Part, 0, value);
}

function GenX_LFOAmount(value) {
  //Synth.ElementLFOFilterDepth(0, 0, value);
  //Synth.ElementLFOFilterDepth(0, 7, value);
  Synth.PartLFODepth(Part, 1, value);
}

function GenX_Frequency(value) {
  for (var i=0; i<8; i++)
    Synth.ElementFilterCutoff(Part, i, value);
}

function GenX_Resonance(value) {
  for (var i=0; i<8; i++)
    Synth.ElementFilterResonance(Part, i, value);
}

function GenX_EnvLevel(value) {
  for (var i=0; i<8; i++)
    Synth.ElementFilterEnvDepth(Part, i, value);
}

function GenX_VCFAttack(value) {
  for (var i=0; i<8; i++)
    Synth.ElementFilterEnvAttack(Part, i, value);
}

function GenX_VCFDecay(value) {
  for (var i=0; i<8; i++)
    Synth.ElementFilterEnvDecay(Part, i, value);
}

function GenX_VCFSustain(value) {
  for (var i=0; i<8; i++)
    Synth.ElementFilterEnvSustain(Part, i, value);
}

function GenX_VCFRelease(value) {
  for (var i=0; i<8; i++)
    Synth.ElementFilterEnvRelease(Part, i, value);
}

function GenX_VCAAttack(value) {
  for (var i=0; i<8; i++)
    Synth.ElementEnvAttack(Part, i, value);
}

function GenX_VCADecay(value) {
  for (var i=0; i<8; i++)
    Synth.ElementEnvDecay(Part, i, value);
}

function GenX_VCASustain(value) {
  for (var i=0; i<8; i++)
    Synth.ElementEnvSustain(Part, i, value);
}

function GenX_VCARelease(value) {
  for (var i=0; i<8; i++)
    Synth.ElementEnvRelease(Part, i, value);
}

function GenX_PWMWidth(value) {
  Synth.PartKnobChange(Part, 0, value);
  Synth.PartLFOElementDepth(Part, 5, 2, value);
  //GenX_PWMCombo(value, null);
}

function GenX_PWMAmount(value) {
  Synth.PartLFODepth(Part, 2, value);
  Synth.ElementLevel(Part, 5, value);
  //Synth.ElementLevel(0, 5, value);
  //GenX_PWMCombo(null, value);
}

function GenX_Chorus(value) {
  if (value)
    Synth.PartEffect(Part, 0, 0x03, 0x20); //SPX Chorus
  else
    Synth.PartEffect(Part, 0, 0x00, 0x00);
}

function GenX_Sub(value) {
  if (value)
    Synth.PartEffect(Part, 1, 0x0D, 0x40, [[1,52],[2,64],[12,127],[14,0],[10,64]]); //Pitch Change
  else
    Synth.PartEffect(Part, 1, 0x00, 0x00);
}

function GenX_Poly(value) {
  if (value)
    Synth.PartMonoPoly(Part, 1);
  else
    Synth.PartMonoPoly(Part, 0);
}
