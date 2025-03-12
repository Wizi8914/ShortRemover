let COLOR_LIST = [
    { HTMLelement: "", color: "#AE67fA", position: 0 },
    { HTMLelement: "", color: "#F49867", position: 100 },
];

let CURRENT_INDEX = 0;
let ANGLE = 90;

let isDraggingSlider = false;
let isDraggingPicker = false;
let isDraggingKnob = false;
let isDraggingGradientSlider = false;
let lastAngle = 0;
let isLoadingCustomGradient = false;

let HUE = 0;
let SATURATION = 0;
let BRIGHTNESS = 1;

const gradientBar = document.querySelector(".preview_container--bar");
const colorSlider = document.getElementById("hue-slider");
const colorThumb = document.getElementById("hueThumb");
const gradientBox = document.getElementById("gradientBox");
const pickerThumb = document.getElementById("pickerThumb");
const hexInput = document.getElementById("hexInput");
const rgbInputs = document.querySelectorAll(".value_container--rgb_item");
const knob = document.querySelector(".rotation_container--knob_item");
const angleInput = document.querySelector(".rotation_container--input");
const submitBtn = document.querySelector(".submit-button");