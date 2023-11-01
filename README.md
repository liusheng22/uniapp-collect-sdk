### 采集指标
- userId group_account project_account
- userId
- role group_account project_account
- 角色不需要 租户一定有 项目不一定有
- 设备信息（ios）  header(ip)
- name

<!--
page_id "/about"
page_title ""
userName
accountName
projectName
phone
-->



### 采集方式
```javascript
internalTrack(config, genAutoRegisterConfig(registerConfig), 'track', {
    event: 'button_click',
    properties: {
      ...extParams,
      session_id: getSessionId(),
      page_id: to.path,
      page_title: getPageName(to),
      button_title: buttonTitle,
      abscissa: pageX,
      ordinate: pageY,
      avail_width: availWidth,
      avail_height: availHeight
    },
  }
)
```

### 问题
- 把方法调用统一 wx?uni?wxb?
