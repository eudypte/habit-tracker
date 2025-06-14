// habit tracker
// for scriptable
// based on: https://github.com/ferraridavide/scriptable/blob/main/days-left.js
// inspired by jvscholz

// ===================================================
// USER CONFIGURATION
// ===================================================

// STEP 1: Enter your habit name (example: "Gym", "Reading", "Meditation")
const EVENT_NAME = "gym";

// STEP 2: Set your start and end dates (Format: YYYY, MM-1, DD)
// IMPORTANT: Months are 0-indexed, meaning January=0, February=1, etc.
// Example: December 25, 2024 would be (2024, 11, 25)
const START_DATE = new Date(2025, 4, 10);  // May 10, 2025
const END_DATE = new Date(2025, 11, 10);    // December 10, 2025

// STEP 3: Add your background image URL
// Replace with your own image URL or leave blank for no image
// To use a transparent background, use the transparent script, then upload it to the internet somewhere and link it here
const BG_IMAGE_URL = "imgur.com/meow";

// STEP 4: Customize the appearance (optional)
// Choose a theme (or make your own)

const theme = "gruv";
var BG_COLOR = "#406260";       // Overlay color in hex format
const BG_OVERLAY_OPACITY = 0.5;   // Overlay opacity (0-1)
var COLOR_FILLED = new Color("#ffffff");         // Color for completed days
var COLOR_UNFILLED = new Color("#ffffff", 0.4);  // Color for remaining days
var TEXT_COLOR = new Color("#ffffff")
var EVENT_COLOR = new Color("#FF0000");

switch(theme){
  case "midnight":
    BG_COLOR = "#406260";
    COLOR_FILLED = new Color("#ffffff");
    COLOR_UNFILLED = new Color("#ffffff", 0.4);
    break;
  case "gruv":
    BG_COLOR = "#4B352A";
    COLOR_FILLED = new Color("#B2CD9C");
    COLOR_UNFILLED = new Color("#F0F2BD", 0.4);
    TEXT_COLOR = new Color("#ffffff", 0.8);
    break;
  case "dark":
    BG_COLOR = "#222831";
    COLOR_FILLED = new Color("#DFD0B8");
    COLOR_UNFILLED = new Color("#948979", 0.4);
    TEXT_COLOR = new Color("#ffffff", 0.8);
    break;
    
}

// STEP 5: Layout settings
// These are optimized for iPhone 15 Pro. You may need to adjust for different devices.
// Increase values for larger screens, decrease for smaller screens.
const PADDING = 8;           // Space around the edges of the widget
const CIRCLE_SIZE = 6;       // Size of the progress dots
const CIRCLE_SPACING = 4;    // Space between dots
const TEXT_SPACING = 8;      // Space between dot grid and text
const DOT_SHIFT_LEFT = 2;
const YEAR_OFFSET = DOT_SHIFT_LEFT - 2;
const DAYS_LEFT_OFFSET = 0;


// ===================================================
// ADVANCED CONFIGURATION
// ===================================================

const NOW = new Date();
const MS_PER_DAY = 86400000;

const DAYS_TOTAL = Math.round((END_DATE - START_DATE) / MS_PER_DAY) + 1;
const DAYS_SINCE_START = Math.max(0, Math.round((NOW - START_DATE) / MS_PER_DAY));
const DAYS_UNTIL_END = Math.max(0, Math.round((END_DATE - NOW) / MS_PER_DAY));

const widget = new ListWidget();

// data 
const fileManager = FileManager.iCloud()
const dataPath = fileManager.documentsDirectory() + "/habits.json"

let habitData = {}

//new data
let newData = args.shortcutParameter
if (newData) {  
  data = newData
  
  const string = JSON.stringify(data)
  fileManager.writeString(dataPath, string)
}

//read data
if (fileManager.fileExists(dataPath)) {
  fileManager.downloadFileFromiCloud(dataPath)
  
  let dataContent = fileManager.readString(dataPath)
  dataContent = JSON.parse(dataContent)
  habitData = dataContent[EVENT_NAME] || {}
}

function formatDate(d) {
    var month = '' + (d.getMonth()+1),
        day = '' + d.getDate()
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

let bgImage = null;
try {
    const req = new Request(BG_IMAGE_URL);
    bgImage = await req.loadImage();
} catch (e) {
    console.log("Couldn't load background image");
}

if (bgImage) {
    widget.backgroundImage = bgImage;
}

const overlay = new LinearGradient();
overlay.locations = [0, 1];
overlay.colors = [
    new Color(BG_COLOR, BG_OVERLAY_OPACITY),
    new Color(BG_COLOR, BG_OVERLAY_OPACITY)
];
widget.backgroundGradient = overlay;

const WIDGET_WIDTH = 320;
const AVAILABLE_WIDTH = WIDGET_WIDTH - (2 * PADDING);
const TOTAL_CIRCLE_WIDTH = CIRCLE_SIZE + CIRCLE_SPACING;
const COLUMNS = Math.floor(AVAILABLE_WIDTH / TOTAL_CIRCLE_WIDTH);
const ROWS = Math.ceil(DAYS_TOTAL / COLUMNS);

const MENLO_REGULAR = new Font("Menlo", 12);
const MENLO_BOLD = new Font("Menlo-Bold", 12);

widget.setPadding(12, PADDING, 12, PADDING);

const gridContainer = widget.addStack();
gridContainer.layoutVertically();

const gridStack = gridContainer.addStack();
gridStack.layoutVertically();
gridStack.spacing = CIRCLE_SPACING;

var counter = 0;
for (let row = 0; row < ROWS; row++) {
  const rowStack = gridStack.addStack();
  rowStack.layoutHorizontally();
  rowStack.addSpacer(DOT_SHIFT_LEFT);
  
  for (let col = 0; col < COLUMNS; col++) {
    const day = row * COLUMNS + col + 1;
    if (day > DAYS_TOTAL) continue;
    
    var date = new Date(START_DATE)
    date.setDate(date.getDate()+day)
    var formattedDate = formatDate(date)
    
    const habitToday = habitData[formattedDate]
    
    const circle = rowStack.addText("●");
    circle.font = Font.systemFont(CIRCLE_SIZE);
    circle.textColor = day <= DAYS_SINCE_START ? COLOR_FILLED : COLOR_UNFILLED;
    
    if(day<=DAYS_SINCE_START){
      if(habitToday=="true"){
      circle.textColor = EVENT_COLOR;
        if(lastDay){
          counter++;
      }
      var lastDay = true 
    }else{
     counter = 1;
     lastDay = false
    }
  }
    if (col < COLUMNS - 1) rowStack.addSpacer(CIRCLE_SPACING);
  }
}

widget.addSpacer(TEXT_SPACING);

const footer = widget.addStack();
footer.layoutHorizontally();

const eventStack = footer.addStack();
eventStack.addSpacer(YEAR_OFFSET);
const eventText = eventStack.addText(EVENT_NAME);
eventText.font = MENLO_BOLD;
eventText.textColor = TEXT_COLOR;

if (counter == 1) counter = 0;
const daysText = `${counter} day streak`;

const textWidth = daysText.length * 7.5;
const availableSpace = WIDGET_WIDTH - (PADDING * 2) - YEAR_OFFSET - (eventText.text.length * 7.5);
const spacerLength = availableSpace - textWidth + DAYS_LEFT_OFFSET;

footer.addSpacer(spacerLength);

const daysTextStack = footer.addStack();
const daysLeft = daysTextStack.addText(daysText);
daysLeft.font = MENLO_REGULAR;
daysLeft.textColor = TEXT_COLOR;

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();
}
Script.complete();
