# HOTFIX TEST INSTRUCTIONS

## What Was Done
Added an **inline script override** in `calculator-app.html` that replaces the cached `callSpatialApi()` function with the correct version that wraps results in a `CALC_RESULT` envelope.

## Commit
- **Commit Hash**: `af4f334`
- **Message**: "HOTFIX: Inline override for api-client.js to bypass CDN cache"
- **Pushed**: Just now

## How to Test

### 1. Wait for GitHub Pages Deployment (~1-2 minutes)
GitHub Actions will automatically deploy the updated HTML.

### 2. Open in Browser
Open a **new incognito/private window** to avoid browser cache:
- https://gerwulf.com/calculator-app.html
- OR: https://gearbox73.github.io/gerwulf-calculators-website/calculator-app.html

### 3. Open Developer Console (F12)

### 4. Look for Hotfix Confirmation
You should see immediately on page load:
```
✅ [HOTFIX] api-client.js function overridden successfully
```

### 5. Test a Calculation
1. Select a **valid table** (not "Select Table...")
2. Enter values:
   - Face Area: `55` m²
   - Openings: `5` m²
   - Limit Distance: `5` m
3. The calculation should trigger automatically

### 6. Expected Console Output
```
🚀 [API-CLIENT-HOTFIX] callSpatialApi() invoked
📦 [API-CLIENT-HOTFIX] Request payload: { Table: 3, ... }
🌐 [API-CLIENT-HOTFIX] Using Web HTTP mode
📡 [API-CLIENT-HOTFIX] Response status: 200
✅ [API-CLIENT-HOTFIX] API result: { NonSprinkler: {...}, Sprinkler: {...}, ... }
📥 [API-CLIENT-HOTFIX] Passing WRAPPED ENVELOPE to receiveFromCSharp()
📥 C# → JS (combined-app): CALC_RESULT    ✅ THIS IS THE KEY LINE
📬 Parsed Command: CALC_RESULT
```

### 7. Success Criteria
- ✅ Console shows `[HOTFIX]` messages instead of `[API-CLIENT]` messages
- ✅ `Parsed Command: CALC_RESULT` (NOT `undefined`)
- ✅ Calculation results appear in the UI fields (Max Open %, Construction requirements, etc.)
- ✅ No more "undefined" command errors

## Why This Works
The inline `<script>` block loads **after** `api-client.js` but **before** `app.js`, so it:
1. Completely replaces the broken cached function
2. Loads from the HTML page itself (not a separate cached JS file)
3. Will work immediately without waiting for CDN propagation of `api-client.js`

## Next Steps After Success
Once confirmed working:
- The cached `api-client.js` will eventually propagate and this hotfix can be removed
- OR: We can leave the hotfix in place as it's harmless even when the JS file is correct

---
**Test Now**: Open incognito window → Check console for `[HOTFIX]` → Test calculation → Report results
