import requests
import heapq
import datetime
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('notifications.log'),
        logging.StreamHandler()
    ]
)

weights = {'Placement': 30, 'Result': 20, 'Event': 10}

CLIENT_ID = "f26c6ee6-eacf-4747-94f5-3aa26c013535"
CLIENT_SECRET = "CFpghKQdunbwGYvu"

def get_token():
    logging.info('getting auth token')
    payload = {
        "email": "rv5982@srmist.edu.in",
        "name": "Rishu Varnwal",
        "rollNo": "RA2311003011502",
        "accessCode": "QkbpxH",
        "clientID": CLIENT_ID,
        "clientSecret": CLIENT_SECRET
    }
    r = requests.post('http://20.207.122.201/evaluation-service/auth', json=payload)
    r.raise_for_status()
    token = r.json()['access_token']
    logging.info('token received')
    return token

def fetch_notifications(token):
    logging.info('fetching notifications')
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get('http://20.207.122.201/evaluation-service/notifications', headers=headers)
    r.raise_for_status()
    items = r.json()['notifications']
    logging.info(f'got {len(items)} notifications')
    return items

def score(n):
    ts = datetime.datetime.strptime(n['Timestamp'], '%Y-%m-%d %H:%M:%S').timestamp()
    return weights.get(n['Type'], 0) * 10**10 + ts

def run():
    token = get_token()
    notifs = fetch_notifications(token)

    h = []
    for n in notifs:
        s = score(n)
        heapq.heappush(h, (s, n['ID'], n))
        if len(h) > 10:
            heapq.heappop(h)

    logging.info('heap built')
    top = sorted(h, key=lambda x: x[0], reverse=True)

    print('----------------------------------------------------------------------')
    print('  PRIORITY INBOX   showing top 10')
    print('----------------------------------------------------------------------')
    print(f"{'Rank':<6}{'Type':<14}{'Message':<28}{'Received'}")
    print('----------------------------------------------------------------------')
    for i, (_, _, n) in enumerate(top, 1):
        print(f"{i:<6}{n['Type']:<14}{n['Message']:<28}{n['Timestamp']}")
    print('----------------------------------------------------------------------')
    logging.info('done')

run()
