from flask import Flask
from app.program import Program
import os

app = Flask(__name__)

print(os.environ.get("OPENAI_API_KEY"))

@app.route("/")
def index():
  program = Program()
  print(program)
  program.model_diagram()
  return "hello world"