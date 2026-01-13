// Configuration
const numFrets = 21; // Matching stratocaster
const numStrings = 6;

// Standard tuning EADGBE (ordered top-to-bottom to match the Python GUI: high E -> B -> G -> D -> A -> low E)
const stringNames = ['E', 'B', 'G', 'D', 'A', 'E'];

const noteSequence = ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#'];

// Wavelength-based color mapping for semitones
// Map C (lowest) to 700nm (red), B (highest) to 400nm (violet)
// Static wavelength-based color mapping for semitones
const wavelengthColorMap = {
    'C':  '#ff0000', // 700nm
    'C#': '#ff2a00', // 675nm
    'D':  '#ff5500', // 650nm
    'D#': '#ff8000', // 625nm
    'E':  '#ffab00', // 600nm
    'F':  '#ffd600', // 575nm
    'F#': '#eaff00', // 550nm
    'G':  '#b5ff00', // 525nm
    'G#': '#00ff80', // 500nm
    'A':  '#00ffd6', // 475nm
    'A#': '#00aaff', // 450nm
    'B':  '#0055ff'  // 425nm
};


// Fret positioning (equal spacing)
const fretSpacing = 40; // Spacing between frets in pixels
const fretPositions = Array.from({length: numFrets + 1}, (_, i) => i * fretSpacing);

// String spacing
const stringSpacing = 25; // Spacing between strings in pixels

// Fret positioning
const maxStringPos = (numStrings - 1) * stringSpacing;

// Chord types organized by category
const chordTypesNested = {
    "TRIADS (3 notes)": {
        "Major": [0, 4, 7],
        "Minor": [0, 3, 7],
        "Diminished": [0, 3, 6],
        "Augmented": [0, 4, 8],
        "Suspended 2nd (sus2)": [0, 2, 7],
        "Suspended 4th (sus4)": [0, 5, 7]
    },
    
    "SEVENTH CHORDS (4 notes)": {
        "Major 7th (maj7)": [0, 4, 7, 11],
        "Dominant 7th (7)": [0, 4, 7, 10],
        "Minor 7th (m7)": [0, 3, 7, 10],
        "Minor-Major 7th (mM7)": [0, 3, 7, 11],
        "Half-Diminished 7th (ø7)": [0, 3, 6, 10],
        "Diminished 7th (dim7)": [0, 3, 6, 9],
        "Augmented 7th (aug7)": [0, 4, 8, 10],
        "Augmented Major 7th (augM7)": [0, 4, 8, 11]
    },
    
    "EXTENDED CHORDS (5+ notes)": {
        "Major 9th (maj9)": [0, 4, 7, 11, 14],
        "Dominant 9th (9)": [0, 4, 7, 10, 14],
        "Minor 9th (m9)": [0, 3, 7, 10, 14],
        "Major 11th (maj11)": [0, 4, 7, 11, 14, 17],
        "Dominant 11th (11)": [0, 4, 7, 10, 14, 17],
        "Minor 11th (m11)": [0, 3, 7, 10, 14, 17],
        "Major 13th (maj13)": [0, 4, 7, 11, 14, 17, 21],
        "Dominant 13th (13)": [0, 4, 7, 10, 14, 17, 21],
        "Minor 13th (m13)": [0, 3, 7, 10, 14, 17, 21]
    },
    
    "ALTERED CHORDS": {
        "7th ♭5": [0, 4, 6, 10],
        "7th #5": [0, 4, 8, 10],
        "7th ♭9": [0, 4, 7, 10, 13],
        "7th #9": [0, 4, 7, 10, 15],
        "7th ♭5♭9": [0, 4, 6, 10, 13],
        "7th #5#9": [0, 4, 8, 10, 15],
        "7alt (altered)": [0, 4, 6, 10, 13, 15]
    },
    
    "ADD CHORDS": {
        "Add 9 (add9)": [0, 4, 7, 14],
        "Minor Add 9 (madd9)": [0, 3, 7, 14],
        "Add 11 (add11)": [0, 4, 7, 17],
        "6th (6)": [0, 4, 7, 9],
        "Minor 6th (m6)": [0, 3, 7, 9],
        "6/9": [0, 4, 7, 9, 14]
    },
    
    "POWER CHORDS & OTHERS": {
        "Power Chord (5)": [0, 7],
        "5add9": [0, 7, 14],
        "Major Triad no 5th": [0, 4],
        "Minor Triad no 5th": [0, 3]
    },

    "Scales": {
        "Major (Ionian)": [0, 2, 4, 5, 7, 9, 11],
        "Minor (Aeolian)": [0, 2, 3, 5, 7, 8, 10],
        "Dorian": [0, 2, 3, 5, 7, 9, 10],
        "Phrygian": [0, 1, 3, 5, 7, 8, 10],
        "Lydian": [0, 2, 4, 6, 7, 9, 11],
        "Mixolydian": [0, 2, 4, 5, 7, 9, 10],
        "Locrian": [0, 1, 3, 5, 6, 8, 10],
        "Pentatonic Major": [0, 2, 4, 7, 9],
        "Pentatonic Minor": [0, 3, 5, 7, 10],
        "Blues Scale": [0, 3, 5, 6, 7, 10],
        "Japanese Scale": [0, 2, 5, 7, 9]
    }
};

// Flatten chord types for easy lookup
const chordTypes = {};
Object.entries(chordTypesNested).forEach(([category, chords]) => {
    Object.entries(chords).forEach(([name, intervals]) => {
        chordTypes[name] = intervals;
    });
});

// Helper function to get chord intervals
function getChordIntervals(chordName) {
    return chordTypes[chordName] || null;
}


// Draw the fretboard on canvas
function drawFretboard(ctx, offsetX = 20, offsetY = 20) {
    const canvasWidth = offsetX * 2 + fretPositions[fretPositions.length - 1];
    const canvasHeight = offsetY * 2 + maxStringPos;
    
    // Draw strings (horizontal lines)
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < numStrings; i++) {
        const yPos = offsetY + i * stringSpacing;
        ctx.beginPath();
        ctx.moveTo(offsetX, yPos);
        ctx.lineTo(offsetX + fretPositions[fretPositions.length - 1], yPos);
        ctx.stroke();
    }
    
    // Draw frets (vertical lines)
    for (let i = 0; i < fretPositions.length; i++) {
        const xPos = offsetX + fretPositions[i];
        
        if (i === 0) {
            // Nut (0 fret) - thick black line
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 4;
        } else {
            // Regular frets
            ctx.strokeStyle = '#999999';
            ctx.lineWidth = 2;
        }
        
        ctx.beginPath();
        ctx.moveTo(xPos, offsetY);
        ctx.lineTo(xPos, offsetY + maxStringPos);
        ctx.stroke();
    }
    
    // Draw fret numbers
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i <= numFrets; i++) {
        const xPos = offsetX + fretPositions[i];
        ctx.fillText(String(i), xPos, offsetY + maxStringPos + stringSpacing * 0.5);
    }
    
    // Draw string names
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 12px Arial';
    for (let i = 0; i < numStrings; i++) {
        const yPos = offsetY + i * stringSpacing;
        ctx.fillText(stringNames[i], offsetX - 10, yPos);
    }
    
    // Draw position markers (inlays)
    const inlayFrets = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24, 27];
    ctx.fillStyle = '#ADD8E6';
    for (let fret of inlayFrets) {
        if (fret < numFrets + 1) {
            // Position between two frets
            const xPos = offsetX + (fretPositions[fret - 1] + fretPositions[fret]) / 2;
            const yMidPos = offsetY + stringSpacing * (numStrings - 1) / 2;
            
            if (fret % 12 === 0) {
                // 12 fret has two dots
                const positions = [yMidPos - stringSpacing * 1.5, yMidPos + stringSpacing * 1.5];
                for (let yPos of positions) {
                    ctx.beginPath();
                    ctx.arc(xPos, yPos, 6, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                // Single dot
                ctx.beginPath();
                ctx.arc(xPos, yMidPos, 6, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

// Draw notes on the fretboard
function drawNotes(ctx, note, chord = '', offsetX = 20, offsetY = 20) {
    drawFretboard(ctx, offsetX, offsetY);
    
    if (!note) {
        return;
    }
    
    const chordIntervals = getChordIntervals(chord);
    
    if (chord && !chordIntervals) {
        console.warn(`Chord '${chord}' not recognized. Showing note only.`);
    }
    
    // Prepare intervals if chord provided
    let intervals = [];
    if (chordIntervals) {
        intervals = chordIntervals.map(i => i % 12);
    }
    
    const noteIdx = noteSequence.indexOf(note);
    if (noteIdx === -1) {
        console.error(`Note '${note}' not found in note sequence`);
        return;
    }
    
    for (let stringIdx = 0; stringIdx < numStrings; stringIdx++) {
        const openNote = stringNames[stringIdx];
        const openNoteIdx = noteSequence.indexOf(openNote);
        for (let fret = 0; fret <= numFrets; fret++) {
            const currentNoteIdx = openNoteIdx + fret;
            // Ensure a non-negative remainder (JS % can be negative for negative operands)
            const semitoneDistance = ((currentNoteIdx - noteIdx) % 12 + 12) % 12;
            let drawDot = false;
            let intervalIdx = 0;
            if (intervals.length > 0) {
                const index = intervals.indexOf(semitoneDistance);
                if (index !== -1) {
                    drawDot = true;
                    intervalIdx = index;
                }
            } else {
                const currentNote = noteSequence[currentNoteIdx % 12];
                if (currentNote === note) {
                    drawDot = true;
                    intervalIdx = 0;
                }
            }
            if (drawDot) {
                const xPos = offsetX + fretPositions[fret];
                const yPos = offsetY + stringIdx * stringSpacing;
                // Use wavelength-based color model for every note dot
                const noteName = noteSequence[currentNoteIdx % 12];
                const noteColor = wavelengthColorMap[noteName] || dotColorHex;
                ctx.fillStyle = noteColor;
                ctx.beginPath();
                ctx.arc(xPos, yPos, 8, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

// Initialize UI when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    // Build chord list with categories
    const chordList = [''];
    const displayToChord = {};
    
    Object.entries(chordTypesNested).forEach(([category, chords]) => {
        chordList.push(category);
        displayToChord[category] = '';
        
        Object.keys(chords).forEach(chordName => {
            const displayName = '  ' + chordName;
            chordList.push(displayName);
            displayToChord[displayName] = chordName;
        });
    });
    
    // Populate note select
    const noteSelect = document.getElementById('noteSelect');
    noteSequence.forEach(note => {
        const option = document.createElement('option');
        option.value = note;
        option.textContent = note;
        noteSelect.appendChild(option);
    });
    
    // Populate chord select
    const chordSelect = document.getElementById('chordSelect');
    chordList.forEach(display => {
        const option = document.createElement('option');
        option.value = display;
        option.textContent = display;
        if (display.startsWith('  ')) {
            option.style.paddingLeft = '20px';
        }
        chordSelect.appendChild(option);
    });
    
    // Canvas setup
    const canvas = document.getElementById('fretboardCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const offsetX = 40;
    const offsetY = 20;
    canvas.width = offsetX * 2 + fretPositions[fretPositions.length - 1];
    canvas.height = offsetY * 2 + maxStringPos + 60;
    
    // Draw initial blank fretboard
    drawFretboard(ctx, offsetX, offsetY);
    
    // Display button handler
    const displayBtn = document.getElementById('displayBtn');
    displayBtn.addEventListener('click', function() {
        const note = noteSelect.value;
        const chordDisplay = chordSelect.value;
        const chord = displayToChord[chordDisplay] || '';
        
        if (!note) {
            alert('Please select a base note');
            return;
        }
        
        try {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawNotes(ctx, note, chord, offsetX, offsetY);
            
            // Update title
            const titleElement = document.getElementById('title');
            titleElement.textContent = chord ? `${note} ${chord}` : note;
        } catch (error) {
            console.error('Error drawing notes:', error);
            alert('Error drawing notes: ' + error.message);
        }
    });
    
    // Save button handler
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.addEventListener('click', function() {
        const titleText = document.getElementById('title').textContent || 'fretboard';
        const safeName = titleText.replace(/[^A-Za-z0-9 _.-]/g, '').replace(/ /g, '_').trim() || 'fretboard';
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = safeName + '.png';
        link.click();
    });
    
    // Allow Enter key on inputs
    noteSelect.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') displayBtn.click();
    });
    
    chordSelect.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') displayBtn.click();
    });
});