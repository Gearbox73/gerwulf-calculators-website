// Web API Client for gerwulf.co Calculator
// This file handles API calls to your Azure backend

let API_BASE_URL = 'https://spatial-separation-calculator-hagnbnewfbdnh5bq.canadacentral-01.azurewebsites.net'; // Will be set by parent window
let SESSION_ID = null;

// Listen for session info from parent window
window.addEventListener('message', (event) => {
    if (event.data.type === 'session') {
        SESSION_ID = event.data.sessionId;
        API_BASE_URL = event.data.apiBaseUrl;
        console.log('✅ Session initialized:', SESSION_ID);
    }
});

async function callSpatialApi() {
    // Helper to handle empty inputs
    const getNum = (id) => {
        const val = parseFloat(document.getElementById(id)?.value);
        return isNaN(val) ? null : val;
    };

    // Matches C# SpatialRequest Record exactly
    const req = {
        Table: document.getElementById('tableSelect').value,
        IsSprinklered: document.getElementById('sprinkYes').checked,
        IsHighResp: document.getElementById('fireRespHigh').checked,
        FaceArea_m2: getNum('areaFace_m2'),
        Openings_m2: getNum('openings_m2'),
        LimitDistance_m: getNum('limitDist_m'),
        BuildingWidth_m: getNum('buildingWidth_m'),
        BuildingHeight_m: getNum('buildingHeight_m')
    };

    if (req.FaceArea_m2 === null || req.LimitDistance_m === null) {
        console.warn("Missing required fields");
        return;
    }

    try {
        // Show loading indicator
        showLoadingIndicator(true);

        // Call the backend API directly
        const response = await fetch(`${API_BASE_URL}/spatial/calculate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Id': SESSION_ID || '' // Optional: track which session made the request
            },
            body: JSON.stringify(req)
        });

        if (!response.ok) {
            console.error('❌ API call failed:', response.status);
            showError('Calculation failed. Please try again.');
            return;
        }

        const result = await response.json();
        console.log('📥 Received nested API response:', result);

        // Update UI with results (uses nested structure from SpatialResult.cs)
        displayResults(result);

    } catch (error) {
        console.error('Error calling API:', error);
        showError('Unable to connect to calculation server. Please check your internet connection.');
    } finally {
        showLoadingIndicator(false);
    }
}

function displayResults(result) {
    console.log('🎨 Displaying results from nested API response...');

    // ===================================================================
    // NON-SPRINKLERED RESULTS (from result.NonSprinkler)
    // ===================================================================
    if (result.NonSprinkler) {
        const ns = result.NonSprinkler;

        // Max Opening Area
        if (ns.MaxOpen_m2 !== null && ns.MaxOpen_m2 !== undefined) {
            const m2El = document.getElementById('maxOpen_m2');
            const ft2El = document.getElementById('maxOpen_ft2');
            if (m2El) m2El.textContent = ns.MaxOpen_m2.toFixed(2) + ' m²';
            if (ft2El) ft2El.textContent = ns.MaxOpen_ft2.toFixed(2) + ' ft²';
            console.log('  ✅ Non-sprinkler max opening:', ns.MaxOpen_m2.toFixed(2), 'm²');
        }

        // Max Percentage Allowed (Z Value)
        if (ns.ZValuePercent !== null && ns.ZValuePercent !== undefined) {
            const pctEl = document.getElementById('maxPercAllowed');
            if (pctEl) pctEl.textContent = ns.ZValuePercent.toFixed(2) + '%';
            console.log('  ✅ Max percentage allowed:', ns.ZValuePercent.toFixed(2), '%');
        }

        // Actual Percentage Provided
        if (ns.ActualPct !== null && ns.ActualPct !== undefined) {
            const actualEl = document.getElementById('percProvided');
            if (actualEl) actualEl.textContent = ns.ActualPct.toFixed(2) + '%';
            console.log('  ✅ Actual percentage:', ns.ActualPct.toFixed(2), '%');
        }

        // Compliance Status (from Pass boolean)
        const complianceEl = document.getElementById('complianceStatus');
        if (complianceEl) {
            const complianceText = ns.Pass ? 'Compliant' : 'Non-Compliant';
            complianceEl.textContent = complianceText;
            complianceEl.className = ns.Pass ? 'status-pass' : 'status-fail';
            console.log('  ✅ Compliance:', complianceText);
        }
    }

    // ===================================================================
    // SPRINKLERED RESULTS (from result.Sprinkler)
    // ===================================================================
    if (result.Sprinkler) {
        const spr = result.Sprinkler;

        // Max Opening Area (Sprinklered)
        if (spr.MaxOpenSpr_m2 !== null && spr.MaxOpenSpr_m2 !== undefined) {
            const m2El = document.getElementById('maxOpenSprink_m2');
            const ft2El = document.getElementById('maxOpenSprink_ft2');
            if (m2El) m2El.textContent = spr.MaxOpenSpr_m2.toFixed(2) + ' m²';
            if (ft2El) ft2El.textContent = spr.MaxOpenSpr_ft2.toFixed(2) + ' ft²';
            console.log('  ✅ Sprinkler max opening:', spr.MaxOpenSpr_m2.toFixed(2), 'm²');
        }

        // Max Percentage Allowed (Sprinklered)
        if (spr.MaxPctAllowedSpr !== null && spr.MaxPctAllowedSpr !== undefined) {
            const pctEl = document.getElementById('maxPercAllowedSprink');
            if (pctEl) pctEl.textContent = spr.MaxPctAllowedSpr.toFixed(2) + '%';
            console.log('  ✅ Sprinkler max percentage:', spr.MaxPctAllowedSpr.toFixed(2), '%');
        }

        // Sprinkler Compliance Status
        const complianceSprinkEl = document.getElementById('complianceStatusSprink');
        if (complianceSprinkEl) {
            const complianceText = spr.Pass ? 'Compliant' : 'Non-Compliant';
            complianceSprinkEl.textContent = complianceText;
            complianceSprinkEl.className = spr.Pass ? 'status-pass' : 'status-fail';
            console.log('  ✅ Sprinkler compliance:', complianceText);
        }
    }

    // ===================================================================
    // CONSTRUCTION REQUIREMENTS (from result.Construction)
    // ===================================================================
    if (result.Construction) {
        const constr = result.Construction;

        // Fire Resistance Rating
        const fireRatingEl = document.getElementById('fireRating');
        if (fireRatingEl && constr.FireResistanceRating) {
            fireRatingEl.textContent = constr.FireResistanceRating;
            console.log('  ✅ Fire rating:', constr.FireResistanceRating);
        }

        // Construction Type Required
        const constructionEl = document.getElementById('constructionType');
        if (constructionEl && constr.ConstructionRequired) {
            constructionEl.textContent = constr.ConstructionRequired;
            console.log('  ✅ Construction required:', constr.ConstructionRequired);
        }

        // Cladding Required
        const claddingEl = document.getElementById('cladding');
        if (claddingEl && constr.CladdingRequired) {
            claddingEl.textContent = constr.CladdingRequired;
            console.log('  ✅ Cladding required:', constr.CladdingRequired);
        }
    }

    console.log('✅ Results displayed successfully');

    // Show success message briefly
    showSuccess('Calculation complete!');
}

function showLoadingIndicator(show) {
    // You can implement a loading spinner here
    const calculateBtn = document.querySelector('button[onclick*="callSpatialApi"]');
    if (calculateBtn) {
        calculateBtn.disabled = show;
        calculateBtn.textContent = show ? 'Calculating...' : 'Calculate';
    }
}

function showError(message) {
    // Simple error display - you can make this more sophisticated
    alert(message);
}

function showSuccess(message) {
    // Simple success display
    console.log('✅', message);
}

// Make sure the function is globally accessible
window.callSpatialApi = callSpatialApi;

