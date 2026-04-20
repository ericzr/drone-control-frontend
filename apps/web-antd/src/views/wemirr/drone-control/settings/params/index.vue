<script lang="ts" setup name="SystemParamsPage">
import { Page } from '@vben/common-ui';

import { ref } from 'vue';

import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  FormItem,
  Input,
  InputNumber,
  Row,
  Select,
  SelectOption,
  Switch,
  message,
} from 'ant-design-vue';

const form = ref({
  systemName: '云界空域OS',
  shortName: '云界',
  mapCenter: '108.94, 34.26',
  defaultZoom: 12,
  mapType: 'mock',
  coordinateSystem: 'WGS84',
  maxFlightAlt: 120,
  defaultFlightSpeed: 10,
  alertAutoAssign: true,
  alertTimeout: 30,
  videoStreamProtocol: 'WebRTC',
  dataRetentionDays: 365,
  enableWeatherCheck: true,
  enableAirspaceCheck: false,
});

function handleSave() {
  message.success('系统参数保存成功');
}

function handleReset() {
  form.value = {
    systemName: '云界空域OS',
    shortName: '云界',
    mapCenter: '108.94, 34.26',
    defaultZoom: 12,
    mapType: 'mock',
    coordinateSystem: 'WGS84',
    maxFlightAlt: 120,
    defaultFlightSpeed: 10,
    alertAutoAssign: true,
    alertTimeout: 30,
    videoStreamProtocol: 'WebRTC',
    dataRetentionDays: 365,
    enableWeatherCheck: true,
    enableAirspaceCheck: false,
  };
  message.info('已恢复默认配置');
}
</script>

<template>
  <Page>
    <Card :bordered="false" title="系统参数配置">
      <template #extra>
        <Button type="primary" @click="handleSave">保存配置</Button>
      </template>

      <Form layout="vertical" :model="form">
        <Divider orientation="left">基本信息</Divider>
        <Row :gutter="24">
          <Col :lg="8" :span="24">
            <FormItem label="系统名称">
              <Input v-model:value="form.systemName" />
            </FormItem>
          </Col>
          <Col :lg="8" :span="24">
            <FormItem label="简称">
              <Input v-model:value="form.shortName" />
            </FormItem>
          </Col>
        </Row>

        <Divider orientation="left">地图配置</Divider>
        <Row :gutter="24">
          <Col :lg="8" :span="24">
            <FormItem label="默认地图中心">
              <Input v-model:value="form.mapCenter" placeholder="经度, 纬度" />
            </FormItem>
          </Col>
          <Col :lg="8" :span="24">
            <FormItem label="默认缩放级别">
              <InputNumber v-model:value="form.defaultZoom" :min="3" :max="20" style="width: 100%" />
            </FormItem>
          </Col>
          <Col :lg="8" :span="24">
            <FormItem label="默认地图源">
              <Select v-model:value="form.mapType">
                <SelectOption value="mock">Mock (开发)</SelectOption>
                <SelectOption value="amap">高德地图</SelectOption>
                <SelectOption value="tianditu">天地图</SelectOption>
                <SelectOption value="mars3d">Mars3D</SelectOption>
              </Select>
            </FormItem>
          </Col>
          <Col :lg="8" :span="24">
            <FormItem label="坐标系">
              <Select v-model:value="form.coordinateSystem">
                <SelectOption value="WGS84">WGS84</SelectOption>
                <SelectOption value="GCJ02">GCJ-02</SelectOption>
                <SelectOption value="CGCS2000">CGCS2000</SelectOption>
              </Select>
            </FormItem>
          </Col>
        </Row>

        <Divider orientation="left">飞行参数</Divider>
        <Row :gutter="24">
          <Col :lg="8" :span="24">
            <FormItem label="最大飞行高度 (m)">
              <InputNumber v-model:value="form.maxFlightAlt" :min="10" :max="500" style="width: 100%" />
            </FormItem>
          </Col>
          <Col :lg="8" :span="24">
            <FormItem label="默认飞行速度 (m/s)">
              <InputNumber v-model:value="form.defaultFlightSpeed" :min="1" :max="30" style="width: 100%" />
            </FormItem>
          </Col>
          <Col :lg="8" :span="24">
            <FormItem label="起飞前气象检查">
              <Switch v-model:checked="form.enableWeatherCheck" />
            </FormItem>
          </Col>
          <Col :lg="8" :span="24">
            <FormItem label="起飞前空域检查">
              <Switch v-model:checked="form.enableAirspaceCheck" />
            </FormItem>
          </Col>
        </Row>

        <Divider orientation="left">告警与数据</Divider>
        <Row :gutter="24">
          <Col :lg="8" :span="24">
            <FormItem label="告警自动指派">
              <Switch v-model:checked="form.alertAutoAssign" />
            </FormItem>
          </Col>
          <Col :lg="8" :span="24">
            <FormItem label="告警超时时长 (分钟)">
              <InputNumber v-model:value="form.alertTimeout" :min="5" :max="1440" style="width: 100%" />
            </FormItem>
          </Col>
          <Col :lg="8" :span="24">
            <FormItem label="视频流协议">
              <Select v-model:value="form.videoStreamProtocol">
                <SelectOption value="WebRTC">WebRTC</SelectOption>
                <SelectOption value="RTSP">RTSP</SelectOption>
                <SelectOption value="RTMP">RTMP</SelectOption>
                <SelectOption value="HLS">HLS</SelectOption>
              </Select>
            </FormItem>
          </Col>
          <Col :lg="8" :span="24">
            <FormItem label="数据保留天数">
              <InputNumber v-model:value="form.dataRetentionDays" :min="30" :max="3650" style="width: 100%" />
            </FormItem>
          </Col>
        </Row>

        <Divider />
        <div class="flex gap-3">
          <Button type="primary" @click="handleSave">保存配置</Button>
          <Button @click="handleReset">恢复默认</Button>
        </div>
      </Form>
    </Card>
  </Page>
</template>
