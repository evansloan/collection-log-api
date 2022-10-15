---
title: /collectionlog/user/:username
position_number: 1
type: get
description: Get a user's collection log by their username
parameters:
  - name: username
    content: Username of the user the collection log belongs to (case insensitive)
    type: string
content_markdown: |-
  Request examples:
left_code_blocks:
  - code_block: |-
      import requests
      
      username = 'durial321'
      url = f'https://api.collectionlog.net/collectionlog/user/{username}'

      response = requests.get(url).json()
      print(response)
    title: Python
    language: python
  - code_block: |-
      const axios = requite('axios');

      const username = 'durial321;
      const url = `https://api.collectionlog.net/collectionlog/user/${username}`

      axios.get(url)
        .then((response) => console.log(response.data))
        .catch((error) => console.error(error));
    title: Node.js
    language: javascript
  - code_block: |-
      curl https://api.collectionlog.net/collectionlog/user/durial321'
    title: Curl
    language: bash
right_code_blocks:
  - code_block: |-
      {
        "collectionLogId": "35ffa464-6259-1656-9ff8-b5efe90b8944",
        "userId": "c7c92efa2-142a-454f-e4da-fcbbe743b83f",
        "collectionLog": {
          "username": "Durial321",
          "accountType": "NORMAL",
          "uniqueObtained": 767,
          "uniqueItems": 1430,
          "tabs": {
            "Bosses": {
              "Abyssal Sire": {
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
                "killCount": [
                  {
                    "name": "Abyssal Sire kills",
                    "amount": 720
                  }
                ]
              },
              ...
            },
            ...
          }
        }
      }
    title: Response
    language: json
---


