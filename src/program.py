import os
import requests
from sys import argv

options = {
    "openai_api_key": "",
    "openai_api_url": "https://api.openai.com/v1/chat/completions",
}


def read_input_data():

    if len(argv) < 2:
        print("[ERROR] The first argument should contain a path to the input data")
        print("e.g. -- python ./src/program.py ./assets/data/reqs1.txt")
        exit(1)

    path_to_input_data = argv[1]

    try:
        with open(path_to_input_data) as file:
            input_data = file.readlines()
    except:
        print(
            f"[ERROR] Unable to read contents of '{path_to_input_data}'. Does the file exist?"
        )
        exit(1)

    input_data_lines = "".join(input_data)

    print(f"[INFO] Successfully read input data from '{path_to_input_data}':")
    print(input_data_lines, end="\n\n")

    return input_data_lines


def refine_prompt(initial_prompt):
    diagram_prompt = "Can you write a representation of a context diagram for a system with the following requirements:"
    refined_prompt = f"{diagram_prompt}\n{initial_prompt}"

    print(f"[INFO] Successfully refined prompt:")
    print(refined_prompt, end="\n\n")

    return refined_prompt


def create_diagram(input):
    openai_api_key = options["openai_api_key"]

    if openai_api_key is None:
        raise ValueError("OpenAI API key is not set in environment variables.")

    request_headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {openai_api_key}",
    }

    request_data = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Hello!"},
        ],
    }

    response = requests.post(
        options["openai_api_url"], headers=request_headers, json=request_data
    )

    if response.status_code == 200:
        print("Response from OpenAI:", response.json())
        print("\n")
        print(response.json()["choices"][0]["message"]["content"])
    else:
        print("Error:", response.status_code, response.text)
    # pass the preprocessed data and create a model
    pass


def render_diagram(diagram):
    pass


input_data = read_input_data()
refined_prompt = refine_prompt(input_data)
diagram = create_diagram(refined_prompt)
output = render_diagram(diagram)
