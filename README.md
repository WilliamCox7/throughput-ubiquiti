# Throughput Test

DISCLAIMER: Only works on windows. I don't have the resources to test for osx/linux.

## Installation

1. git clone https://github.com/WilliamCox7/throughput-ubiquiti
2. cd throughput-ubiquiti
3. npm install
4. node index.js
5. Allow mongod/mongo exec call
6. view localhost:3000 in browser

## Usage

### Begin Throughput Test
1. Enter iperf server ip address in the empty input field
2. Enter the credentials for that ip address
3. Click start.

### View History
1. Dropdown any field
  a. options are in chronological order from when they were stored
  b. not all options in dropdown match a timestamp
  c. history does not include currently-running throughput
    i. refresh to view added history
    
## Client/AP Specifications (tested for)
Client: Razer Blade Stealth
AP: Ubiquiti Amplifi Router

### Results From Testing
I noticed that the data transferred is typically higher for downstream than upstream throughput. When I would change the window size, the amount transferred would significantly drop which in turn would control or at least limit the amount of bandwidth.
