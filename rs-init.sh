#!/usr/bin/bash
mongosh --host mongo1:27017 <<EOF
rs.initiate({
  _id: "rs01",
  members: [
    { _id: 0, host: "mongo1:27017" },
    { _id: 1, host: "mongo2:27017" },
    { _id: 2, host: "mongo3:27017" }
  ]
})
EOF