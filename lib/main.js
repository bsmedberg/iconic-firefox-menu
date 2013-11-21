"use strict";

const self = require("sdk/self");
const windows = require("sdk/windows");
const stylesheet_utils = require("sdk/stylesheet/utils");
const simple_prefs = require("sdk/simple-prefs");
const window_namespace = require("sdk/window/namespace");

// Cribbed from sdk/windows/firefox.js
function getChromeWindow(window) {
  return window_namespace.windowNS(window).window;
}

var current_sheet = null;

function doUnloadInWindow(window) {
  try {
    stylesheet_utils.removeSheet(getChromeWindow(window), current_sheet);
  }
  catch (e) { }
}

function doUnload() {
  console.log("doUnload");
  for (let window of windows.browserWindows) {
    doUnloadInWindow(window);
  }
}

function doLoadInWindow(window) {
  var domWin = getChromeWindow(window);
  console.log("doLoadInWindow", domWin.location.href, current_sheet);

  stylesheet_utils.loadSheet(domWin, current_sheet);
  console.log("done doLoadInWindow");
}

function doLoad() {
  try {
  console.log("doLoad");
  if (current_sheet !== null) {
    doUnload();
  }

  switch (simple_prefs.prefs["icontype"]) {
    case "outline":
      current_sheet = self.data.url("outline.css");
      break;
    case "fullcolor":
      current_sheet = self.data.url("fullcolor.css");
      break;
    case "hamburger":
      current_sheet = self.data.url("hamburger.css");
      break;
    default:
      current_sheet = self.data.url("outline.css");
  }
  for (let window of windows.browserWindows) {
    doLoadInWindow(window);
  }
  }
  catch (e) {
    console.log(e.toString(), e.stack);
  }
}

exports.main = function() {
  console.log("main");
  doLoad();
  windows.browserWindows.on("open", doLoadInWindow);
  simple_prefs.on("icontype", doLoad);
};

exports.onUnload = doUnload;
