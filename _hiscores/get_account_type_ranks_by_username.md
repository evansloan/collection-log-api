---
title: /hiscores/ranks/:username
position_number: 2
type: get
description: Get a user's account type hiscores ranks
parameters:
  - name: username
    content: Username of the user to retrieve hiscores ranks for (case insensitive)
    type: string
content_markdown: |-
  Request examples:
left_code_blocks:
  - code_block: |-
      import requests

      username = 'durial321'
      url = f'https://api.collectionlog.net/hiscores/ranks/{username}'
      
      response = requests.get(url).json()
      print(response)
    title: Python
    language: python
  - code_block: |-
      const axios = require('axios');

      const username = 'durial321';
      const url = `https://api.collectionlog.net/hiscores/ranks/${username}`;

      axios.get(url)
        .then((response) => console.log(response.data))
        .catch((error) => console.error(error));
    title: Node.js
    language: javascript
  - code_block: |-
      curl https://api.collectionlog.net/hiscores/ranks/duria321
    title: Curl
    language: bash
right_code_blocks:
  - code_block: |-
      {
        "rank": "12749",
        "ironmanRank": null,
        "hardcoreIronmanRank": null,
        "ultimateIronmanRank": null,
        "groupIronmanRank": null,
        "hardcoreGroupIronmanRank": null,
        "normalRank": "1166"
      }
    title: Response
    language: json
---


