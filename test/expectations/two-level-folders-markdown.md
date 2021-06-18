## As a Sport User, i can find a sport place

### As a Sport User, I can see all ice hockey sport places within 99km around McGill University in Montréal, Canada

Request Name | Status | failed | API Method | API Response | API URL |  API Status | API Code
---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ----------
| Get all ice hockey sport places within 99km around McGill University in Montréal, Canada | PASS :white_check_mark: |  | GET |  | https://sportplaces.api.decathlon.com/api/v1/places?origin=-73.582,45.511&radius=99&sports=175 | OK | 200 |

### As a Sport User, i can see one specific place

Request Name | Status | failed | API Method | API Response | API URL |  API Status | API Code
---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ----------
| Show one place | FAIL :x: | Status code is 200 , AssertionError , expected response to have status code 200 but got 404 | GET | { "error": "Not found" } | https://sportplaces.api.decathlon.com/api/v1/places/8b1e3027-e438-42c2-92ab-5ebd23f68d54 | Not Found | 404 |

## As a Sport User, i can see sport details

### As a Sport User, i can find all sports

Request Name | Status | failed | API Method | API Response | API URL |  API Status | API Code
---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ----------
| List all sports with allowed filters & tags | PASS :white_check_mark: |  | GET |  | https://sportplaces-api.decathlon.com/api/v1/sports | OK | 200 |

### As a Sport User, i can see sport details

Request Name | Status | failed | API Method | API Response | API URL |  API Status | API Code
---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ----------
| Show details for a sport | PASS :white_check_mark: |  | GET |  | https://sportplaces-api.decathlon.com/api/v1/sports/12 | OK | 201 |