from __future__ import print_function
import sys
import json
from inspect import getargspec
from LGTV_INIT import LGTVScan, LGTVClient, getCommands

# from flask import Flask, request
# from flask_restful import Resource, Api
# from sqlalchemy import create_engine
# from json import dumps
# from flask.ext.jsonpify import jsonify
# from ws4py.client.threadedclient import WebSocketClient


def usage(error=None):
    if error:
        print ("Error: " + error)
    print ("LGTV Controller")
    print ("Author: Karl Lattimer <karl@qdh.org.uk>")
    print ("Usage: lgtv <command> [parameter]\n")
    print ("Available Commands:")

    print ("  scan")
    print ("  auth                  Hostname/IP    Authenticate and exit, creates initial config ~/.lgtv.json")

    for c in getCommands(LGTVClient):
        print ("  " + c, end=" ")
        print (" " * (20 - len(c)), end=" ")
        args = getargspec(LGTVClient.__dict__[c])
        print (' '.join(args.args[1:-1]))


def parseargs(command, argv):
    args = getargspec(LGTVClient.__dict__[command])
    args = args.args[1:-1]

    if len(args) != len(argv):
        raise Exception("Argument lengths do not match")

    output = {}
    for (i, a) in enumerate(args):
        #
        # do some basic conversions for bools, ints and floats
        #
        if argv[i].lower() == "true":
            argv[i] = True
        elif argv[i].lower() == "false":
            argv[i] = False
        try:
            f = int(argv[i])
            argv[i] = f
        except:
            try:
                f = float(argv[i])
                argv[i] = f
            except:
                pass
        output[a] = argv[i]
    return output


if __name__ == '__main__':
    if len(sys.argv) < 2:
        usage("Too few arguments")
    elif sys.argv[1] == "scan":
        results = LGTVScan()
        if len(results) > 0:
            print (json.dumps({
                "result": "ok",
                "count": len(results),
                "list": results
            }))
        else:
            print (json.dumps({
                "result": "failed",
                "count": len(results)
            }))
    elif sys.argv[1] == "on":
        ws = LGTVClient()
        ws.on()
    elif sys.argv[1] == "auth":
        if len(sys.argv) < 3:
            usage("Hostname or IP is required for auth")
        ws = LGTVClient(sys.argv[2])
        ws.connect()
        ws.run_forever()
    else:
        try:
            ws = LGTVClient()
            try:
                args = parseargs(sys.argv[1], sys.argv[2:])
            except Exception as e:
                usage(e.message)
            ws.connect()
            ws.exec_command(sys.argv[1], args)
            ws.run_forever()
        except KeyboardInterrupt:
            ws.close()


# app = Flask(__name__)
# api = Api(app)
#
# class On(Resource):
#     def get(self):
#         ws = LGTVClient()
#         ws.on()
#         return {'TV': 'on'}
#
# class Off(Resource):
#     def get(self):
#         initialize
#         ws = LGTVClient()
#         ws.off()
#         return {'TV': 'off'}
#
# class Apps(Resource):
#     def get(self):
#         ws = LGTVClient()
#         print("apps", ws.listApps)
#         return {'Apps':'0'}
#
# class Mute(Resource):
#     def get(self):
#         ws = LGTVClient()
#         ws.mute()
#         return {'Mute':'On'}
#
#
# api.add_resource(On, '/tv-on') # Route_1
# api.add_resource(Off, '/tv-off') # Route_2
# api.add_resource(Apps, '/apps')
# api.add_resource(Mute, '/mute')

# if __name__ == '__main__':
#      app.run(port=5002)

# if __name__ == '__main__':
#      app.run(
#          host=app.config.get("HOST", "localhost"),
#          port=app.config.get("PORT", 4000)
#      )
