
# API_KEY environment variable must be set before running this script

# Creates diagram by specifying path to input data
python3 ./src/program.py --input-data ./assets/data/reqs1.txt --api-key $API_KEY

# Creates diagram by getting guidelines every time
# python3 ./src/program.py --input-data ./assets/data/reqs1.txt --api-key $API_KEY --dynamic-guidelines