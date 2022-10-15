---
title: /hiscores/:page
position_number: 1
type: get
description: Get a specific hiscores page
parameters:
  - name: page
    content: Hiscores page number to retrieve
    type: int
query_parameters:
  - name: accountType
    content: Account type filter
    type: '"ALL"|"NORMAL"|"IRONMAN"|"HARDCORE_IRONMAN"|"ULTIMATE_IRONMAN"|"GROUP_IRONMAN"|"HARDCORE_GROUP_IRONMAN" (optional)'
content_markdown: |-
  Request examples:
left_code_blocks:
  - code_block: |-
      import requests

      page = 1
      url = f'https://api.collectionlog.net/hiscores/{page}'
      
      # Get first page of hiscores for all account types
      response = requests.get(url).json()
      print(response)

      # Get first page of hiscores for ironman accounts
      response = requests.get(url, params={'accountType': 'IRONMAN'}).json()
      print(response)
    title: Python
    language: python
  - code_block: |-
      const axios = requite('axios');

      const page = 1;
      const url = `https://api.collectionlog.net/hiscores/${page}`;

      // Get first page of hiscores for all account types
      axios.get(url)
        .then((response) => console.log(response.data))
        .catch((error) => console.error(error));

      // Get first page of hiscores for ironman accounts
      axios.get(url, {params: {accountType: 'IRONMAN'})
        .then((response) => console.log(response.data))
        .catch((error) => console.error(error))
    title: Node.js
    language: javascript
  - code_block: |-
      # Get first page of hiscores for all account types
      curl https://api.collectionlog.net/hiscores/1?accountType=IRONMAN
    title: Curl
    language: bash
right_code_blocks:
  - code_block: |-
      {
        hiscores: [
          {
            "username": "Durial321",
            "accountType": "NORMAL",
            "rank": 1,
            "obtained: "767",
            "total": 1430
          },
          ...
        ]
      }
    title: Response
    language: json
---


