import glob
import json
import string
import random

# paths = glob.glob("./views/*")
# server_ip = 'https://sebastienbiollo.com:443'
# local_ip = "http://localhost:3001"

# for path in paths:
#     new_file = []
#     with open(path, 'r') as f:
#         for i in f.readlines():
#             if local_ip in i:
#                 i = i.replace(local_ip, server_ip)
#             # if "141087998031-3ks8dqpakedg4oa65oja0n0aa4rv8g3p.apps.googleusercontent.com" in i:
#             #     i = i.replace("141087998031-3ks8dqpakedg4oa65oja0n0aa4rv8g3p.apps.googleusercontent.com",
#             #                   "184507738418-664h9ifot6obetrd887dp5hgi5opopr2.apps.googleusercontent.com")
#             new_file.append(i)

#     with open(path, 'w') as f:
#         f.writelines(new_file)


new_file = []
with open("./models/common/config/env.config.js", 'r') as f:
    
    for i in f.readlines():
        randomToken = ''.join(random.SystemRandom().choice(
            string.ascii_uppercase + string.ascii_lowercase + string.digits + "!-_+") for _ in range(50))
        if "jwtSecret2" in i:
            i = i.replace(i, '    "jwtSecret2": "' + randomToken + '",\n')
        elif "jwtSecret" in i:
            i = i.replace(i,  '    "jwtSecret": "' + randomToken + '",\n')
        
        new_file.append(i)

with open("./models/common/config/env.config.js", 'w') as f:
    f.writelines(new_file)


for path in ["./models/authorization/routes.config.js", "./models/authorization/controllers/authorization.controller.js", "./models/common/middlewares/auth.validation.middleware.js"]:
    new_file = []
    with open(path, 'r') as f:
        for i in f.readlines():
            if "FORSERVER" in i:
                i = i.replace("//FORSERVER ", "")
            new_file.append(i)

    with open(path, 'w') as f:
        f.writelines(new_file)
