@echo off

start cmd /k C:\devjs\mongodb\server\bin\mongod.exe --dbpath=C:\devjs\mongodb\data\


pause

start cmd /k C:\devjs\mongodb\server\bin\mongo.exe