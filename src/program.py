import os
from sys import argv
import requests
from openai import OpenAI

options = {
    "openai_api_key": "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",
    "showmediagrams_guidelines_url": "https://showme.redstarplugin.com/diagram-guidelines",
    "showmediagrams_render_url": "https://showme.redstarplugin.com/render",
}

openai_client = OpenAI(api_key=options["openai_api_key"])


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


def get_diagram_guidelines():
    request_payload = {
        "explicitlyRequestedByUserDiagramLanguage": "mermaid",
        "diagramType": "graph",
    }

    response = requests.get(
        options["showmediagrams_guidelines_url"], params=request_payload
    )

    if not response.ok:
        error = response.text
        raise RuntimeError(f"[ERROR] Unable to fetch diagram guidelines:\n{error}")

    response_payload = response.json()
    diagram_guidelines = response_payload["diagramGuidelines"]

    return diagram_guidelines


def refine_prompt(input_data):
    system_message = get_diagram_guidelines()

    # Preprocess input data here
    user_message = input_data

    print(f"[INFO] Successfully refined prompt:")
    print(f"{system_message}\n{user_message}", end="\n\n")

    return system_message, user_message


def create_diagram(system_message, user_message):
    # response = openai_client.chat.completions.create(
    #     model="gpt-3.5-turbo",
    #     messages=[
    #         {"role": "system", "content": system_message},
    #         {"role": "user", "content": user_message},
    #     ],
    # )

    # response_content = response.choices[0].message.content

    response_content = """
```mermaid
graph TB
  U["User"] -- "Register" --> L["Login"]
  U -- "Modify<br />Profile Details" --> UPD["Update Profile"]
  U -- "Create<br />Sellable Products" --> CSP["Create Products"]
  U -- "Purchase Products" --> PP["Purchase Products"]
  U -- "Logout" --> LO[""]
  A["Admin"] -- "Modify or Delete Products" --> CSP
```
"""

    print("[INFO] Successfully created diagram:")
    print(response_content, end="\n\n")

    return response_content


def render_diagram(diagram):
    request_payload = {
        "diagramLanguage": "mermaid",
        "diagramType": "graph",
        "d2Theme": "neutral-grey_sketch",
        "diagram": diagram,
    }

    response = requests.get(
        options["showmediagrams_render_url"], params=request_payload
    )

    if not response.ok:
        raise RuntimeError("[ERROR] Unable to fetch diagram guidelines")

    response_payload = response.json()
    print(response_payload["results"])

    return response_payload


input_data = read_input_data()
system_message, user_message = refine_prompt(input_data)
diagram = create_diagram(system_message, user_message)
output = render_diagram(diagram)
