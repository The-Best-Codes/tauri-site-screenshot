import { invoke } from "@tauri-apps/api/core";
import { AlertCircle, Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import "./App.css";
import { copyImage } from "./utils/copyImage";

function App() {
  const [url, setUrl] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const takeScreenshot = async () => {
    if (!url) {
      setError("Please enter a valid URL");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result: any = await invoke("take_screenshot", { url });

      if (result.success) {
        setScreenshot(result.image_data);
        setError(null);
      } else {
        setScreenshot(null);
        setError(result.message || "Failed to take screenshot");
      }
    } catch (e: any) {
      console.error(e);
      setScreenshot(null);
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const copyScreenshotToClipboard = async () => {
    if (!screenshot) return;

    try {
      // 1. Create an Image object
      const img = new Image();
      img.onload = async () => {
        // 2. Create a Canvas and draw the image onto it
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Could not get 2D context from canvas");
        }
        ctx.drawImage(img, 0, 0);

        // 3. Get the RGBA pixel data from the canvas
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const rgbaData = imageData.data; // This is a Uint8ClampedArray

        // 4. Convert Uint8ClampedArray to Uint8Array (required by clipboard-manager)
        const rgbaArray = new Uint8Array(rgbaData);

        // 5. Call copyImage
        await copyImage(rgbaArray);
        alert("Screenshot copied to clipboard!");
      };

      img.onerror = (err) => {
        console.error("Error loading image:", err);
        alert("Error loading the screenshot for copying.");
      };

      // Set the image source (the base64 string)
      img.src = screenshot;
    } catch (err: any) {
      console.error("Failed to copy:", err);
      alert("Failed to copy screenshot to clipboard: " + err.message);
    }
  };

  return (
    <main className="app-container">
      <div className="card">
        <h1>Website Capture</h1>
        <p className="subtitle">Take beautiful screenshots of any website</p>

        <form
          className="url-form"
          onSubmit={(e) => {
            e.preventDefault();
            takeScreenshot();
          }}
        >
          <div className="input-group">
            <input
              id="url-input"
              type="url"
              onChange={(e) => setUrl(e.currentTarget.value)}
              placeholder="https://example.com"
              value={url}
              required
            />
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="loader-icon" size={18} />
                  Loading
                </>
              ) : (
                "Capture Screenshot"
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {screenshot && (
          <div className="result-container">
            <div className="result-header">
              <h2>Screenshot Preview</h2>
              <div className="action-buttons">
                <button
                  onClick={copyScreenshotToClipboard}
                  className="icon-button"
                  title="Copy to clipboard"
                >
                  <Copy size={18} className="copy-icon" />
                  Copy
                </button>
              </div>
            </div>
            <div className="screenshot-wrapper">
              <img src={screenshot} alt="Website Screenshot" />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
