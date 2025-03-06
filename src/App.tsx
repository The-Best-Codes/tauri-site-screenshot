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
  const [copying, setCopying] = useState(false);

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

    setCopying(true);

    try {
      // Convert data URL to blob
      const res = await fetch(screenshot);
      const blob = await res.blob();

      // Convert blob to array buffer
      const arrayBuffer = await blob.arrayBuffer();

      // Pass array buffer to clipboard
      await copyImage(arrayBuffer);
      alert("Screenshot copied to clipboard!");
    } catch (err: any) {
      console.error("Failed to copy:", err);
      setError(`Failed to copy screenshot to clipboard: ${err.message}`);
    } finally {
      setCopying(false);
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
                  disabled={copying}
                >
                  {copying ? (
                    <>
                      <Loader2 size={18} className="loader-icon" />
                      Copying...
                    </>
                  ) : (
                    <>
                      <Copy size={18} className="copy-icon" />
                      Copy
                    </>
                  )}
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
