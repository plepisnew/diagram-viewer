import os
from sys import argv
import requests
from openai import OpenAI
import re
from parse_args import program_args
from pathlib import Path

__diagrams_api_base_url__ = "https://showme.redstarplugin.com"

options = {
    "openai_api_key": program_args["api_key"],
    "input_data_descriptor": program_args["input_data"],
    "cache_guidelines": program_args["cache_guidelines"],
    "diagrams_api_base_url": __diagrams_api_base_url__,
    "diagrams_api_guidelines_url": f"{__diagrams_api_base_url__}/diagram-guidelines",
    "diagrams_api_render_url": f"{__diagrams_api_base_url__}/render"
}

class Program:
    def __init__(self):
        self.__openai_client__ = OpenAI(api_key=options["openai_api_key"])

    # Performs the entire Requirements Modeling flow
    def model_diagram(self):
        input_data = self.__read_input_data__()

        user_message = self.__refine_prompt__(input_data)
        system_message = self.__get_diagram_guidelines__()

        diagram = self.__create_diagram__(system_message, user_message)
        diagram_url = self.__render_diagram__(diagram)
        print(diagram_url)

    def debug(self):
        self.__read_input_data__()
        print(options)

    # Reads input from the local filesystem if an existing path is passed
    def __read_input_data__(self):
        input_data = options["input_data_descriptor"]

        try:
            with open(input_data) as file:
                input_data = "".join(file.readlines())
                print(f"[INFO] Using data read from '{options['input_data_descriptor']}':")
        except:
            print(f"[INFO] Using data passed as argument:")

        print(input_data, end="\n\n")

        return input_data

    # Obtains Mermaid Graph diagram guidelines either by reading them from the cache or requesting from Diagrams API
    def __get_diagram_guidelines__(self):
        if options["cache_guidelines"]:
            cached_guidelines_path = os.path.join(Path(__file__).parent, "mermaid_graph_guidelines.txt")
            
            with open(cached_guidelines_path) as f:
                cached_guidelines = "".join(f.readlines())
                print("[INFO] Retrieved diagram guidelines from cache")

                return cached_guidelines

        request_payload = {
            "explicitlyRequestedByUserDiagramLanguage": "mermaid",
            "diagramType": "graph",
        }

        response = requests.get(options["diagrams_api_guidelines_url"], params=request_payload)

        if not response.ok:
            error = response.text
            print(f"[ERROR] Unable to fetch diagram guidelines: {error}")
            exit(1)

        response_payload = response.json()
        diagram_guidelines = response_payload["diagramGuidelines"]

        print("[INFO] Retrieved diagram guidelines from Diagrams API:")

        return diagram_guidelines

    # Apply Prompt Engineering guidelines
    def __refine_prompt__(self, input_data):
        # Preprocess input data here
        user_message = input_data

        return user_message


    # Creates the diagram by giving ChatGPT diagram guidelines and requirements
    def __create_diagram__(self, system_message, user_message):
        response = self.__openai_client__.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message},
            ],
        )
    
        response_payload = response.choices[0].message.content
        get_code_regex = "(?<=```mermaid\\n)(.|\\n)*(?=```)"
        
        if match := re.search(get_code_regex, response_payload):
            diagram = match.group(0)
        else:
            diagram = response_payload

        print("[INFO] Successfully created diagram:")
        print(diagram, end="\n\n")
    
        return diagram

    # Renders the diagram by sending the diagram created by ChatGPT to Diagrams API (to obtain a visualization)
    def __render_diagram__(self, diagram):
        request_payload = {
            "diagramLanguage": "mermaid",
            "diagramType": "graph",
            "d2Theme": "neutral-grey_sketch",
            "diagram": diagram,
        }

        response = requests.get(options["diagrams_api_render_url"], params=request_payload)
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

        print(f"[INFO] Successfully rendered diagram:")
        print(system_response, end="\n\n")

        return diagram_url

runner = Program()
runner.model_diagram()
