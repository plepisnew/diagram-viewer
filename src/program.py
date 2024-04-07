import os
from sys import argv
import requests
from openai import OpenAI, OpenAIError
import re

options = {
    "openai_api_key": os.environ.get("OPENAI_API_KEY"),
    "showmediagrams_api_base_url": "https://showme.redstarplugin.com",
    "showmediagrams_api_guidelines_path": "/diagram-guidelines",
    "showmediagrams_api_render_path": "/render",
}

class Program:

    def __init__(self):
        try:
            self.__openai_client__ = OpenAI(api_key=options["openai_api_key"])
        except OpenAIError as err:
            print("[ERROR] Please specify the environment variable OPENAI_API_KEY to enable API calls against ChatGPT")
            exit(1)

        api_base_url = options["showmediagrams_api_base_url"]
        self.__guidelines_url__ = f"{api_base_url}{options['showmediagrams_api_guidelines_path']}"
        self.__render_url__ = f"{api_base_url}{options['showmediagrams_api_render_path']}"

    def model_diagram(self):
        input_data = self.__read_input_data()

        user_message = self.__refine_prompt(input_data)
        system_message = self.__get_diagram_guidelines()

        diagram = self.__create_diagram(system_message, user_message)
        url = self.__render_diagram(diagram)

    def __read_input_data(self):
        if len(argv) < 2:
            print("[ERROR] The first program argument should contain a path to the input data")
            print("e.g. -- python3 ./src/program.py ./assets/data/reqs1.txt")
            exit(1)

        path_to_input_data = argv[1]

        try:
            with open(path_to_input_data) as file:
                input_data = file.readlines()
        except:
            print(f"[ERROR] Unable to read contents of '{path_to_input_data}'. Does the file exist?")
            exit(1)

        input_data_lines = "".join(input_data)

        print(f"[INFO] Successfully read input data from '{path_to_input_data}':")
        print(input_data_lines, end="\n\n")

        return input_data_lines

    def __get_diagram_guidelines(self):
        request_payload = {
            "explicitlyRequestedByUserDiagramLanguage": "mermaid",
            "diagramType": "graph",
        }

        response = requests.get(self.__guidelines_url__, params=request_payload)

        if not response.ok:
            error = response.text
            print(f"[ERROR] Unable to fetch diagram guidelines: {error}")
            exit(1)

        response_payload = response.json()
        diagram_guidelines = response_payload["diagramGuidelines"]

        return diagram_guidelines

    def __refine_prompt(self, input_data):
        # Preprocess input data here
        user_message = input_data

        return user_message

    def __create_diagram(self, system_message, user_message):
        # response = openai_client.chat.completions.create(
        #     model="gpt-3.5-turbo",
        #     messages=[
        #         {"role": "system", "content": system_message},
        #         {"role": "user", "content": user_message},
        #     ],
        # )
    
        # response_content = response.choices[0].message.content
    
        response_content = """graph TB
  A["Web Browser"] -- "HTTP API Request" --> B["Load Balancer"]
  B -- "HTTP Request" --> C["Crossover"]
  C -- "Talks to" --> D["Redis"]
  C -- "Talks to" --> E["MySQL"]
  C -- "Downstream API Request" --> F["Multiplex"]
  F -- "Returns Job ID" --> C
  C -- "Long Poll API Request" --> G["Evaluator"]
  G -- "API Call" --> F
  G -- "API Call" --> H["Result-Fetcher"]
  H -- "Downloads Results" --> I["S3 or GCP Cloud Buckets"]
  I -- "Results Stream" --> G
  G -- "Results Stream" --> C
  C -- "API Response" --> A
"""
    
        print("[INFO] Successfully created diagram:")
        print(response_content, end="\n\n")
    
        return response_content

    def __render_diagram(self, diagram):
        request_payload = {
            "diagramLanguage": "mermaid",
            "diagramType": "graph",
            "d2Theme": "neutral-grey_sketch",
            "diagram": diagram,
        }

        response = requests.get(self.__render_url__, params=request_payload)
        response_payload = response.json()
        api_result = response_payload["results"][0]

        system_response = api_result["interpretingTheAPIResponse"]
        extract_url_regex = "(?<=\[View fullscreen diagram\]\().*(?=\))"

        if match := re.search(extract_url_regex, system_response):
            diagram_url = match.group(0)
        else:
            print("[ERROR] Unable to render diagram")
            print(response.text)
            exit(1)

        print(f"[INFO] Successfully rendered diagram: {diagram_url}")
        print(system_response)

        return system_response

runner = Program()
runner.model_diagram()
