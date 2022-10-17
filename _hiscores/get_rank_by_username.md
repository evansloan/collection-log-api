---
title: /hiscores/rank/:username
position_number: 2
type: get
description: Get a user's hiscores rank by their username
parameters:
  - name: username
    content: Username of the user to retrieve hiscores rank for (case insensitive)
    type: string
content_markdown: |-
  Request examples:
left_code_blocks:
  - code_block: |-
      import requests

      username = 'durial321'
      url = f'https://api.collectionlog.net/hiscores/rank/{username}'
      
      response = requests.get(url).json()
      print(response)
    title: Python
    language: python
  - code_block: |-
      const axios = require('axios');

      const username = 'durial321';
      const url = `https://api.collectionlog.net/hiscores/rank/${username}`;

      axios.get(url)
        .then((response) => console.log(response.data))
        .catch((error) => console.error(error));
    title: Node.js
    language: javascript
  - code_block: |-
      curl https://api.collectionlog.net/hiscores/rank/duria321
    title: Curl
    language: bash
right_code_blocks:
  - code_block: |-
      {
        "username": "Durial321",
        "rank": 791
      }
    title: Response
    language: json
---


