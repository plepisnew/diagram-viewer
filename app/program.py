import os
from sys import argv
import requests
import openai
import re
from pathlib import Path

__diagrams_api_base_url__ = "https://showme.redstarplugin.com"

if __name__ == "__main__":
    from app.parse_args import program_args
    options = {
        "openai_api_key": program_args["api_key"],
        "input_data_descriptor": program_args["input_data"],
        "cache_guidelines": program_args["cache_guidelines"],
        "diagrams_api_base_url": __diagrams_api_base_url__,
        "diagrams_api_guidelines_url": f"{__diagrams_api_base_url__}/diagram-guidelines",
        "diagrams_api_render_url": f"{__diagrams_api_base_url__}/render"
    }

options = {
    "openai_api_key": ,
    "input_data_descriptor": program_args["input_data"],
    "diagrams_api_base_url": __diagrams_api_base_url__,
    "diagrams_api_guidelines_url": f"{__diagrams_api_base_url__}/diagram-guidelines",
    "diagrams_api_render_url": f"{__diagrams_api_base_url__}/render"
}

class Program:
    def __init__(self, api_key):
        self.openai_client = openai.OpenAI(api_key=api_key)

    # Performs the entire Requirements Modeling flow
    def model_diagram(self, data):
        if data is None:
            return { "ok": False, "error": "Missing input data" }
        
        user_message = self.__refine_input__(input_data)

        diagram_guidelines = self.__read_diagram_guidelines__()
        system_message = self.__refine_prompt__(diagram_guidelines)

        diagram = self.__create_diagram__(system_message, user_message)
        diagram_url = self.__render_diagram__(diagram)
        print(diagram_url)

    # Reads input from the local filesystem if an existing path is passed; otherwise use parameter as payload
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

    # Clean up the input data either by re-formatting or making slight adjustments. This yields the user message (data)
    def __refine_input__(self, input_data):
        user_message = input_data

        return user_message

    # Obtains Mermaid Graph diagram guidelines either by reading them from the cache or requesting from Diagrams API
    def __read_diagram_guidelines__(self):
        if options["cache_guidelines"]:
            cached_guidelines_path = os.path.join(Path(__file__).parent, "mermaid_graph_guidelines.txt")
            
            with open(cached_guidelines_path) as f:
                cached_guidelines = "".join(f.readlines())
                print("[INFO] Retrieved diagram guidelines from cache")

                return cached_guidelines

        request_payload = {
            "explicitlyRequestedByUserDiagramLanguage": "mermaid",
            "diagramType": "requirement",
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

    # Applies different Prompt Engineering strategies and guidelines to optimize generated diagrams. This yields the system message (metadata)
    def __refine_prompt__(self, guidelines):
        system_message = guidelines
        
        return system_message

    # Creates the diagram by giving ChatGPT a system message (guidelines + prompt techniques) and a user message (cleaned up input data)
    def __create_diagram__(self, system_message, user_message, temperature):
        try:
            response = self.__openai_client__.chat.completions.create(
                model="gpt-3.5-turbo",
                temperature=temperature,
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": user_message},
                ],
            )
        except openai.AuthenticationError:
            print("[ERROR] Invalid API key presented")
            exit(1)

        response_payload = response.choices[0].message.content
        # get_code_regex = "(?<=```requirementDiagram\\n)(.|\\n)*(?=```)"
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