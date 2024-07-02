from boto3 import Session
from botocore.exceptions import BotoCoreError, ClientError
from contextlib import closing
import os
import sys
from flask import Flask, request, url_for, render_template, redirect, flash
import PyPDF2

app = Flask(__name__)
app.secret_key = os.getenv('MY_SECRET_KEY')

# Create a client using the credentials and region defined in the [adminuser]
# section of the AWS credentials file (~/.aws/credentials).
aws_access_key_id = os.getenv('AWS_ACCESS_KEY')
aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
session = Session(aws_access_key_id=aws_access_key_id,
                  aws_secret_access_key=aws_secret_access_key,
                  region_name="us-west-2",)
polly = session.client("polly")


@app.route("/", methods=["GET", "POST"])
def home():
    response = polly.describe_voices()
    all_voices = [voice["Id"] for voice in response["Voices"]]
    return render_template("index.html", voices=all_voices)


@app.route("/upload", methods=["GET", "POST"])
def upload_file():
    global text, get_voice
    if "pdf_file" not in request.files:
        return "No file is uploaded", 404

    my_file = request.files["pdf_file"]

    pdf_reader = PyPDF2.PdfReader(my_file.stream)
    num_pages = len(pdf_reader.pages)
    text = ""

    for page_num in range(num_pages):
        page = pdf_reader.pages[page_num]
        text += page.extract_text()


################### Getting the voice name #######################
    get_voice = request.form.get("my_voice")

################### Enable Amazon Polly to recognize the text and convert it into voice

    return redirect(url_for("play_audio", filename=my_file.filename))


@app.route("/play", methods=["GET", "POST"])
def play_audio():
    pdf_name = request.args.get("filename").split(".")[0]
    try:
        # Request speech synthesis
        response = polly.synthesize_speech(Text=f"{text}", OutputFormat="mp3",
                                           VoiceId=f"{get_voice}")
    except (BotoCoreError, ClientError) as error:
        # The service returned an error, exit gracefully
        flash(f"{error}, This voice does not configured yet")
        return redirect(url_for("home"))

    # Access the audio stream from the response
    if "AudioStream" in response:
        # Note: Closing the stream is important because the service throttles on the
        # number of parallel connections. Here we are using contextlib.closing to
        # ensure the close method of the stream object will be called automatically
        # at the end of the with statement's scope.
        with closing(response["AudioStream"]) as stream:
            output = os.path.join('static', 'audio', "speech.mp3")

            try:
                # Open a file for writing the output as a binary stream
                with open(output, "wb") as file:
                    file.write(stream.read())
            except IOError as error:
                # Could not write to file, exit gracefully
                print(error)
                sys.exit(-1)

    else:
        # The response didn't contain audio data, exit gracefully
        print("Could not stream audio")
        sys.exit(-1)


    return render_template("play_audio.html", audio_file=output, filename=pdf_name)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
