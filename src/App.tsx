import { useState } from "react";
import { Upload, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Convert the image to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    setPrediction(null);

    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file.");
        return;
      }

      try {
        const base64Image = await convertToBase64(file);
        setSelectedImage(base64Image);
      } catch {
        setError("Failed to read the file. Please try again.");
      }
    }
  };

  const handlePrediction = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const base64Image = selectedImage?.split(",")[1]; // Remove the base64 header
      if (!base64Image) throw new Error("Invalid image data");

      // Call your Lambda API endpoint
      const response = await fetch("https://lx762kggmshhor3uysosv7l6a40opfwn.lambda-url.us-west-1.on.aws/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64Image }),
      });

      console.log(response)

      if (!response.ok) {
        throw new Error("Failed to get prediction");
      }

      const data = await response.json();
      setPrediction(data.disease || "No disease detected.");
    } catch (err) {
      setError("Failed to analyze the image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-800 dark:text-green-100 mb-4">
            Crop Disease Detection
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Upload an image of your plant to identify potential diseases.
          </p>
        </div>

        <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 transition-colors hover:border-green-500 dark:hover:border-green-400">
              {selectedImage ? (
                <div className="space-y-4 w-full">
                  <img
                    src={selectedImage}
                    alt="Selected plant"
                    className="max-h-[400px] mx-auto rounded-lg shadow-lg"
                  />
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedImage(null);
                        setPrediction(null);
                        setError(null);
                      }}
                    >
                      Remove Image
                    </Button>
                    <Button
                      onClick={handlePrediction}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        "Analyze Image"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="w-full cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <div className="flex flex-col items-center gap-4">
                    <Upload className="h-12 w-12 text-gray-400" />
                    <div className="text-center">
                      <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                        Drop your image here, or{" "}
                        <span className="text-green-600 dark:text-green-400">browse</span>
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Supports JPG, PNG files.
                      </p>
                    </div>
                  </div>
                </label>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {prediction && (
              <Alert className="bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800">
                <AlertTitle className="text-green-800 dark:text-green-100">
                  Disease Detection Result
                </AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-200">
                  {prediction}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default App;
