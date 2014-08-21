// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by a Apache
// license that can be found in the LICENSE file.

var BaseObject = require('base_object');
var Settings = require("./settings")
var _ = require("underscore")
var log = require('./log');

class UploadHandler extends BaseObject {
  constructor() {
    this.maxUploadSlots = Settings.maxUploadSlots
    this.slots = {}
  }

  getSlot(peerId) {
    this.checkAndFreeSlots()
    if (_.contains(this.slots.keys, peerId) || (_.size(this.slots) < this.maxUploadSlots)) {
      this.slots[peerId] = Date.now()
      this.trigger('uploadhandler:update', {occupiedSlots: _.size(this.slots), totalSlots: this.maxUploadSlots})
      return true
    } else {
      log.warn("doesn't have free upload slots")
      return false
    }
  }

  checkAndFreeSlots() {
    var now = Date.now() - Settings.uploadSlotTimeout
    _.each(this.slots, function (timestamp, peerId) {
      if (timestamp <= now) {
        log.warn("freeing upload slot")
        delete this.slots[peerId]
        this.trigger('uploadhandler:update', {occupiedSlots: _.size(this.slots), totalSlots: this.maxUploadSlots})
      }
    }, this)
  }
}

UploadHandler.getInstance = function() {
  if (this._instance === undefined) {
    this._instance = new this();
  }
  this._instance.trigger('uploadhandler:update', {totalSlots: this._instance.maxUploadSlots})
  return this._instance;
}

module.exports = UploadHandler
