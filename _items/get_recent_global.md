---
title: /items/global
position_number: 2
type: get
description: Get the 30 most recent items obtained by all users ordered by date obtained (limit 1 item per user)
content_markdown: |-
  Request examples:
left_code_blocks:
  - code_block: |-
      import requests

      url = f'https://api.collectionlog.net/items/global'
      
      response = requests.get(url).json()
      print(response)
    title: Python
    language: python
  - code_block: |-
      const axios = requite('axios');

      const url = `https://api.collectionlog.net/items/global`;

      axios.get(url)
        .then((response) => console.log(response.data))
        .catch((error) => console.error(error));
    title: Node.js
    language: javascript
  - code_block: |-
      curl https://api.collectionlog.net/items/global
    title: Curl
    language: bash
right_code_blocks:
  - code_block: |-
      {
        items: [
          {
            "id": 11998,
            "name": "Smoke battlestaff",
            "quantity": 1,
            "obtained": true,
            "obtainedAt": "2022-10-03T17:16:55.484Z",
            "username": "Durial321"
          },
          ...
        ]
      }
    title: Response
    language: json
---


