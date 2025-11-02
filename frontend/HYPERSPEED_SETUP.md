# Hyperspeed Component Setup

## Status
- ✅ `postprocessing` package installed
- ✅ `Hyperspeed.css` created
- ⏳ `Hyperspeed.js` - **YOU NEED TO CREATE THIS FILE**

## Instructions

### Step 1: Create Hyperspeed.js
Create the file: `frontend/src/components/Hyperspeed/Hyperspeed.js`

Copy the ENTIRE Hyperspeed component code you provided (it's ~1000+ lines with THREE.js setup, shaders, Car Lights, Road, LightsSticks classes, etc.)

The file should start with:
```javascript
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect, SMAAPreset } from 'postprocessing';
import './Hyperspeed.css';

const Hyperspeed = ({ effectOptions = { ... } }) => {
  // ... rest of the component
};

export default Hyperspeed;
```

### Step 2: Preset Colors (already customized for STIVAN)
The Home page will use these colors:
- Road: Dark gray (#080808)
- Cars (left): Purple/Pink (#D856BF, #6750A2, #C247AC)
- Cars (right): Blue/Cyan (#03B3C3, #0E5EA5, #324555)
- Light sticks: Cyan (#03B3C3)

### Step 3: Once Hyperspeed.js is created
The Home page is ready to use it - it's already configured in Home.js!

## File Structure
```
frontend/src/components/Hyperspeed/
  ├── Hyperspeed.js  ← YOU NEED TO CREATE THIS
  └── Hyperspeed.css ← ALREADY CREATED ✅
```
