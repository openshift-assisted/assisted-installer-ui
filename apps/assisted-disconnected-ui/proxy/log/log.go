package log

import (
	"github.com/sirupsen/logrus"
)

var log *logrus.Logger

func InitLogs() *logrus.Logger {
	log = logrus.New()
	log.SetReportCaller(true)
	return log
}

func GetLog() *logrus.Logger {
	return log
}
