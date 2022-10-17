---
title: /items/user/:username
position_number: 3
type: get
description: Get a specific collection log page of items for a user
parameters:
  - name: username
    content: Username of the user to retrieve items for (case insensitive)
    type: string
query_parameters:
  - name: pageName
    content: Name of the page to get items for
    type: string
content_markdown: |-
  Request examples:
left_code_blocks:
  - code_block: |-
      import requests

      username = 'durial321'
      pagename = 'Abyssal Sire'
      url = f'https://api.collectionlog.net/items/user/{username}'
      
      response = requests.get(url, params={'pageName': pagename}).json()
      print(response)
    title: Python
    language: python
  - code_block: |-
      const axios = require('axios');

      const username = 'durial321';
      const pagename = 'Abyssal Sire';
      const url = `https://api.collectionlog.net/items/user/${username}`;

      axios.get(url, {params: {pageName: pagename}})
        .then((response) => console.log(response.data))
        .catch((error) => console.error(error));
    title: Node.js
    language: javascript
  - code_block: |-
      curl https://api.collectionlog.net/items/user/duria321?pageName=Abyssal%20Sire
    title: Curl
    language: bash
right_code_blocks:
  - code_block: |-
      {
        "username": "Durial321",
        "page": "Abyssal Sire",
        "itemCount": 9,
        "obtainedCount": 7,
        "items": [
          {
            "id": 13262,
            "name": "Abyssal orphan",
            "quantity": 0,
            "obtained": false,
            "sequence": 0
          },
          ...
        ],
        "killCounts": [
          {
            "name": "Abyssal Sire kills",
            "amount": 720
          }
        ]
      }
    title: Response
    language: json
---


