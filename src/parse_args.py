from sys import argv
import argparse

parser = argparse.ArgumentParser(description="Transform Software Requirements into a UML Context Diagram.")

parser.add_argument(
  "--input-data",
  dest="input_data",
  metavar="$PATH_TO_INPUT",
  type=str,
  required=True,
  help="Used to specify Software Requirements. If a path to a file is specified, its contents (in UTF-8) will be used as the input data. Otherwise, the value passed will be used as the input data.")

parser.add_argument(
  "--api-key",
  dest="api_key",
  metavar="$OPENAI_API_KEY",
  type=str,
  required=True,
  help="Your OpenAI API key. This is required for making API calls against the ChatGPT API. You can configure your API keys here: https://platform.openai.com/api-keys"
)

parser.add_argument(
  "--dynamic-guidelines",
  dest="cache_guidelines",
  help="Specify whether diagram guidelines should be fetched. By default, guidelines are assumed static and are cached. Specifying this flag will fetch guidelines on every run.",
  action="store_false"
)

program_args = vars(parser.parse_args())
