import os
import subprocess
from pathlib import Path
import streamlit as st
import streamlit.components.v1 as components

# 1. Streamlit Page Configuration
st.set_page_config(
    page_title="Quorum — Autonomous Multi-Agent AI Interview Panel Simulator",
    page_icon="🏛️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# 2. Complete Edge-to-Edge True Fullscreen Styles (eliminates all black borders and padding)
st.markdown(
    """
    <style>
        /* Force Root & Streamlit App Containers to 100% viewport */
        html, body, #root, [data-testid="stAppViewContainer"], [data-testid="stApp"], .main, .block-container {
            padding: 0 !important;
            margin: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            overflow: hidden !important;
            background: #f9f9ff !important;
        }
        
        /* Completely hide Streamlit header, footer, decoration, toolbar */
        header, footer, #MainMenu, [data-testid="stToolbar"], [data-testid="stHeader"], [data-testid="stDecoration"], .stDeployButton {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        
        /* True Fullscreen Iframe covering entire browser viewport */
        iframe {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            min-height: 100vh !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            z-index: 999999 !important;
            background: #f9f9ff !important;
        }
    </style>
    """,
    unsafe_allow_html=True
)

BASE_DIR = Path(__file__).parent.resolve()
DIST_DIR = BASE_DIR / "dist"
ASSETS_DIR = DIST_DIR / "assets"

def ensure_built():
    """Ensure the React/Vite app is compiled into dist."""
    if not DIST_DIR.exists() or not (DIST_DIR / "index.html").exists():
        try:
            subprocess.run(["npm", "run", "build"], cwd=str(BASE_DIR), check=True, capture_output=True)
        except Exception as e:
            st.error(f"Build failed: {e}")

def get_bundled_html() -> str:
    """Reads dist/index.html and inlines CSS, JS, and Live API Key into a standalone payload."""
    ensure_built()
    index_path = DIST_DIR / "index.html"
    
    if not index_path.exists():
        return "<h3>Error: Build artifact not found. Please verify npm run build succeeded.</h3>"

    raw_html = index_path.read_text(encoding="utf-8")

    # Locate generated CSS and JS files in dist/assets
    css_content = ""
    js_content = ""

    if ASSETS_DIR.exists():
        for file in ASSETS_DIR.glob("*.css"):
            css_content += file.read_text(encoding="utf-8") + "\n"
        for file in ASSETS_DIR.glob("*.js"):
            js_content += file.read_text(encoding="utf-8") + "\n"

    # Replace external asset links with inlined style and script
    import re
    clean_html = raw_html
    clean_html = re.sub(r'<link[^>]*rel="stylesheet"[^>]*>', '', clean_html)
    clean_html = re.sub(r'<script[^>]*src="[^"]*"[^>]*></script>', '', clean_html)

    # Extract Gemini API Key from Streamlit Secrets or Environment
    gemini_key = ""
    try:
        if hasattr(st, "secrets") and "GEMINI_API_KEY" in st.secrets:
            gemini_key = st.secrets["GEMINI_API_KEY"]
    except Exception:
        pass
    
    if not gemini_key:
        gemini_key = os.environ.get("GEMINI_API_KEY", "")

    key_script = ""
    if gemini_key:
        key_script = f'<script>window.__GEMINI_API_KEY__ = "{gemini_key}";</script>\n'

    # Inject inlined styles and keys into <head>
    injected_head = f"{key_script}<style>\n{css_content}\n</style>"
    clean_html = clean_html.replace("</head>", f"{injected_head}\n</head>")

    # Inject inlined JS into <body>
    injected_scripts = f'<script type="module">\n{js_content}\n</script>'
    clean_html = clean_html.replace("</body>", f"{injected_scripts}\n</body>")

    return clean_html

# 3. Render Quorum in Streamlit
html_payload = get_bundled_html()
components.html(html_payload, height=1200, scrolling=True)
