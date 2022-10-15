---
title: /items/recent/:username
position_number: 1
type: get
description: Get a user's 5 most recent obtained items by their username ordered by date obtained
parameters:
  - name: username
    content: Username of the user to retrieve items for (case insensitive)
    type: string
content_markdown: |-
  Request examples:
left_code_blocks:
  - code_block: |-
      import requests

      username = 'durial321'
      url = f'https://api.collectionlog.net/items/recent/{username}'
      
      response = requests.get(url).json()
      print(response)
    title: Python
    language: python
  - code_block: |-
      const axios = requite('axios');

      const username = 'durial321';
      const url = `https://api.collectionlog.net/items/recent/${username}`;

      axios.get(url)
        .then((response) => console.log(response.data))
        .catch((error) => console.error(error));
    title: Node.js
    language: javascript
  - code_block: |-
      curl https://api.collectionlog.net/items/recent/duria321
    title: Curl
    language: bash
right_code_blocks:
  - code_block: |-
      [
        {
          "id": 11998,
          "name": "Smoke battlestaff",
          "quantity": 1,
          "obtained": true,
          "obtainedAt": "2022-10-03T17:16:55.484Z"
        },
        ...
      ]
    title: Response
    language: json
---


