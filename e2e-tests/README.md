# E2E Selenium tests for STIVAN frontend

This folder contains a pytest-based Selenium test suite that exercises the frontend pages (excluding Forgot Password and Community pages as requested).

Files
- `selenium_tests.py` — the test suite (uses Chrome via webdriver-manager).
- `requirements.txt` — Python packages required.

Quick start (Windows PowerShell)

1. Install Python 3.8+ and ensure `python` is on your PATH.
2. From PowerShell, create and activate a virtual environment (optional but recommended):

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
```

3. Install dependencies:

```powershell
python -m pip install -r .\e2e-tests\requirements.txt
```

4. Start your frontend dev server (the tests default to http://localhost:3000). If you use a different port, set the environment variable `STIVAN_BASE_URL` before running tests. Example (PowerShell):

```powershell
# If your frontend runs on a different URL, set it:
$env:STIVAN_BASE_URL = 'http://localhost:3000'
```

5. Run the tests:

```powershell
python -m pytest .\e2e-tests -q
```

Notes & troubleshooting
- Tests run headless by default. To see the browser during runs, edit `selenium_tests.py` and remove or change the `--headless=new` option in ChromeOptions.
- The suite is resilient to backend absence where possible: it checks UI changes and toasts instead of requiring successful API responses.
- If Chrome is not available on your machine, install it or change the driver to use another browser and corresponding webdriver-manager class.
