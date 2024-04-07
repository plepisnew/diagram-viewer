import requests
import os

url = "https://showme.redstarplugin.com/d/d:ltwilyjg"

response = requests.get(url)

blob_data = response.content

with open("test.txt", "wb") as f:
  f.write(blob_data)

