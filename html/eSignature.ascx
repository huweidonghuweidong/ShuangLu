<%@ Control Language="VB" Inherits="Manulife.Core.Mvc.Views.EnhancedViewUserControl" %>
<%@ Import Namespace="Manulife.Cn.AWS.Web" %>
<%
    'JsFileRefreshWithDateTimeVersion_houjin
    Dim timeNowString As String = DateTime.Now.ToString("yyyyMMddHHmmss")        
%>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>电子签名</title>


<link rel='stylesheet' type='text/css' href="<%: Url.Content("~/Content/iview.css")%>" />


<script src="<%: Url.Content("~/Scripts/vue.min.js")%>" type="text/javascript"></script>
<script src="<%: Url.Content("~/Scripts/iview.min.js")%>" type="text/javascript"></script>
<script src="<%: Url.Content("~/Scripts/axios.min.js")%>" type="text/javascript"></script>
<script src="<%: Url.Content("~/Scripts/anysignWebInterface.js")%>" type="text/javascript"></script> 
<script src="<%: Url.Content("~/Scripts/math.js")%>" type="text/javascript"></script> 
<link rel='stylesheet' type='text/css' href="<%: Url.Content("~/Content/esignature.css?v="+timeNowString)%>" />
<style>
.borderB{
    display:inline-block;
    border-bottom:1px solid #333;
    width:50px;
    text-align:center;
}
</style>
<div id="app" style="height:100%;">
    <div v-if="isLoading">
        <div class="background-loading">
        </div>
        <div class="loading-indicator">
        </div>
    </div>
    <template>
        <!-- 电子签名  -->
        <Card id="autographCard" style="width:80%;margin-left:auto;margin-right:auto;margin-top:10px;margin-bottom:60px;">
            <p slot="title">
                <span class="tit-all">电子签名</span>
            </p>
            <Collapse v-model="panelValue">
                <!-- 文档确认 -->
                <Panel name="1">
                    <span class="tit tit1">文档确认</span><span class="tit-tips tit-tips1">（请阅读并勾选确认下列投保资料）</span>
                    <span class="tit-point tit-point1"></span>
                    <div slot="content" style="position:relative;">
                        <div class="statePop" v-show="documentState"></div>
                        
                        <div style="position:absolute;bottom:0;left:108px;z-index:10;"><i-button type="primary" style="marin-left:20px;" @click="timerAgain" v-show="timerAgainState">重新开始</i-button></div>
                        <checkbox-group id="wdqr" v-model="documentList"  @on-change="checkAll">
                            <Row>
                                <ul class="eSignature-list">
                                    <li>
                                        <Checkbox label="notice" id="notice"> 
                                            <i-button type="primary" style="margin-left:10px;" @click.stop="noticeInfo">  投保须知  </i-button>
                                        </Checkbox>
                                    </li>
                                    
                                    <li>
                                         <Checkbox label="application" id="application">
                                            <i-button type="primary" style="margin-left:10px;" @click.stop="applicationInfo">  投保信息资料  </i-button>
                                        </Checkbox>
                                    </li>
                                    <li  v-if="!isAccident">
                                        <Checkbox label="proposal" id="proposal">
                                            <i-button type="primary" style="margin-left:10px;" @click.stop="proposalInfo">  计划书  </i-button>
                                        </Checkbox>
                                    </li>
                                    <li>
                                        <Checkbox label="bank" :disabled="!sqState" id="bank">
                                            <i-button type="primary" style="margin-left:10px;" @click.stop="bankTransfer">
                                                <span v-if="!inputBankTransfer">  转账授权书（未确认） </span>
                                                <span v-else>  转账授权书  </span>
                                            </i-button>
                                        </Checkbox>
                                        <span v-show="zzsIdiea"  @click.stop="bankTransfer" style="color:red;font-size:12px;position: absolute;top:1px;left:165px;width:160px;">请点击并阅读确认</span> <!-- v-if="!inputBankTransfer"  -->
                                    </li>
                                    <li v-if="showDocFin"> <!-- showDocFin -->
                                        <Checkbox label="financial" id="cwwj">
                                            <i-button type="primary" style="margin-left:10px;" @click.stop="financialInfo">
                                                <span v-show="!inputFinancial">  财务问卷（未填写）  </span>
                                                <span v-show="inputFinancial">  财务问卷  </span>
                                            </i-button>
                                        </Checkbox>
                                    </li>
                                    <li v-if="showFnaCQ">
                                        <Checkbox label="fnacq" id="fnacq">
                                            <i-button type="primary" style="margin-left:10px;" @click.stop="fnaCQInfo">  人身保险客户需求分析问卷  </i-button>
                                        </Checkbox>
                                    </li>
                                    <li v-if="showFnaNB">
                                        <Checkbox label="fnanb" id="fnanb">
                                            <i-button type="primary" style="margin-left:10px;" @click.stop="fnaNBInfo">  新型人身保险产品风险承受能力测评问卷  </i-button>
                                        </Checkbox>
                                    </li>
                                    <li style="height:23px;">
                                        <Checkbox label="declaration" :disabled="!affState" id="declaration">
                                            <i-button v-if="sxIdiea" type="primary" style="margin-left:10px;" @click.stop="declarationInfo">  被保险人与投保人声明（未确认）  </i-button>
                                            <i-button v-else type="primary" style="margin-left:10px;" @click.stop="declarationInfo">  被保险人与投保人声明  </i-button>
                                            <div v-if="sxIdiea" style="position:relative;left:239px;top:-21px;width:160px;"><span style="color:red;font-size:12px;width:160px;">请点击并阅读确认</span> <!-- v-if="!affState"  --></div>
                                            
                                        </Checkbox>    
                                    </li>
                                    <li>
                                        <Checkbox label="reminder" id="reminder">
                                            <i-button type="primary" style="margin-left:10px;" @click.stop="reminderInfo">  投保提示书  </i-button>
                                        </Checkbox>
                                    </li>

                                    <li v-if="doubleShow">
                                         <Checkbox label="exemption" id="exemption">
                                            <i-button type="primary" style="margin-left:10px;" @click.stop="exemptionHandle"> 免责条款说明书 </i-button>
                                        </Checkbox>
                                    </li>
                                </ul>
                                
                            </Row>
                       
                        </checkbox-group>
                        <checkbox-group v-model="confirmDocumentList"  @on-change="agreeCheck(cliInfo.length)" v-for="(cli,index) in cliInfo" style="margin-top:15px;">
                            <row>
                                <checkbox :label="index" :disabled="allState">
                                    <span>{{getLinkTypDesc(cli.linkTyp)}}({{cli.cliNm}})已阅读并确认上述投保资料的内容</span>
                                </checkbox>
                            </row>
                        </checkbox-group>
                        <row style="margin-left:10px;margin-top:25px;">
                            <i-button type="primary" @click="confirmDocument" :disabled="agreeState">下一步</i-button>
                        </row>
                    </div>
                </Panel>

                <!-- 新型产品风险语句抄录 newProductType commentState-->
                <Panel name="2" v-show="newProductType">
                    <span class="tit" style="width:180px;" >新型产品风险提示抄录</span>
                    <span class="tit-point" style="left:180px;"></span>
                    <div slot="content" style="position:relative;">
                        <div v-show="commentState" class="statePop"></div>
                        <row>
                            <i-button type="primary" style="margin-left:10px;" @click="showComment('yjcl')" :disabled="commentFileId">语句抄录</i-button>
                            <i-button type="primary" style="margin-left:10px;" @click="showCommentState()" v-if="commentFileId">抄录预览</i-button>
                        </row>
                        <row>
                            <span class="state-text" style="display:inline-block;margin-top:5px;" v-if="commentFileId">语句抄录已完成</span>
                        </row>
                    </div>
                </Panel>
               
                <!-- 电子签名 -->
                <Panel name="4">
                    <span class="tit" style="width:510px;">电子签名</span><span class="tit-tips tit-tips1">（请客户确认并勾选以下声明后依次完成电子签名，字体需清晰完整）</span>
                    <span class="tit-point" style="left:510px;"></span>
                    <div slot="content">
                        <p v-if="isInsuredChild" class="dd-des">被保险人{{insuredChildName}}为未成年人,请投保人代为签署</p>
                        <checkbox-group v-model="confirmedSignStatementClientTypeList" v-for="(cli) in signCliInfo"  style="margin-top:15px;">
                            <row>
                                <!-- 签署声明按客户身份逐一显示，并需要勾选确认，未勾选确认不能进行电子签名。未成年人无需显示签署声明 -->
                                <Checkbox v-if="cli.linkTyp != 'G'" :label="cli.linkTyp"  :disabled="cli.SignFileId">
                                    <span  class="dd-des">  {{getSignLinkTypDesc(cli.linkTyp)}}{{cli.cliNm}}声明：本人通过电子签名方式对以上文档亲自签署确认; 本人在此处的签名样本可同时使用于前面所列示的所有投保文档。</span>
                                </Checkbox>
                            </row>
                        </checkbox-group>
                        <div class="esign-box"  v-for="cli in signCliInfo" style="position:relative;">
                            <div v-show="blockShowSign(eSignStatus,cli,confirmedSignStatementClientTypeList)" class="statePop"></div>
                            <row style="display: flex;width:100%;height:100%;justify-content: center; align-items: center;position:relative;">
                                    <div style="margin-right:10px;">
                                        <!-- 如果是监护人 则不显示[监护人:XXX] 而直接显示 [签名格式为 XXX XXX代] -->
                                        <span v-if="cli.linkTyp != 'G'" style="display:block;" @click="showSign(cli,cli.cliNum,cli.linkTyp,'dzqm')">{{getSignLinkTypDesc(cli.linkTyp)}}:{{cli.AboveSignDesc}}</span>
                                        <span v-else style="display:block;" @click="showSign(cli,cli.cliNum,cli.linkTyp,'dzqm')">签名格式为: </span>
                                        <span style="display:block;">{{cli.BottomSignDesc}}</span>
                                    </div>
                                   
                                    <img :src= "cli.SignFileImage ? cli.SignFileImage : (str+qm)" v-show="cli.SignFileId" :id="setImgId('imgSign',cli.cliNum + cli.linkTyp)" style="max-height:60px;max-width:120px;" /> 
                            </row> 
                        </div>
                    </div>
                </Panel>


                <!-- 人脸识别及持证拍照 -->
                <Panel name="3">
                    <!--20200880_Gray begin-->
                    <%--<span style="width:500px;" class="tit">人脸识别及持证拍照</span>--%><span class="tit-tips tit-tips1" style="left: 150px;">（请依次点击以下相机按钮，为客户进行人脸识别）</span>
                    <span style="width:500px;" class="tit">人脸识别</span><span class="tit-tips tit-tips1" style="left: 70px;">（请依次点击以下相机按钮，为客户进行人脸识别）</span>
                    <!--20200880_Gray end-->
                    <span class="tit-point" style="left:496px;"></span>
                    <div slot="content" v-for="(cli,index) in signCliInfo" class="esign-box" style="height:150px;position:relative;"  v-show="cli.age >= 18">
                        <div v-show="eSignStatus != 'E3' || cli.bioFacialTyp == 'FR' || cli.bioFacialTyp == 'PT'" class="statePop"></div> <!-- BIOFicialState  -->
                        <row style="width:100%;">
                            <i-col span="24" style="text-align:center" class="pz-box">
                                <div @click="showRecoModal(cli, index, 'rlsb')" style="width:240px;overflow:hidden;">
                                    <span class="camera-img" style="width:70px;"></span>
                                     <p class="mt10">{{getSignLinkTypDesc(cli.linkTyp)}}:{{cli.cliNm}}</p>
                                </div>
                               
                                <div class="photo-show-box">
                                    <span class="state-text" v-if="cli.bioFacialTyp == 'FR' || cli.bioFacialTyp == 'PT'">已完成</span>
                                </div>
                                
                            </i-col>
                        </row>
                    </div>
                   </Panel> 
                    
                 <!-- 见证人 -->
                <Panel name="5" v-show="jzrPanelState">
                    
                    <span v-show="true" class="tit" style="width:531px;">见证人</span><span class="tit-tips tit-tips1" style="left:53px;">（请点击以下签字框，按提示请见证人完成电子签名，字体清晰可识别）</span>    
                    <span v-show="true" class="tit-point" style="left:527px;"></span>
                    
                    
                    <div slot="content" v-for="cli in jzrInfo" style="position:relative;">
                        <div v-show="jzrState" class="statePop"></div>
                        <div class="tips-p-box">
                            <p>保险营销员声明：</p>
                            <p>本人声明已就投保单上的所有事项对投保人及被保险人进行当面询问，并对投保人及被保人在投保单上亲笔签名证实。</p>
                            <p>本人已核对了客户（包括投保人、被保险人、法定继承人以外的受益人）的身份证原件，已确认投保人和被保险人的关系。</p>
                            <p>同时，本人在此确认客户的身份信息与其在投保单上填写的信息一致。</p>
                        </div>
                        <row>
                            <span @click="showSign(cli,cli.cliNum,cli.linkTyp,'jzr')" class="jzr-span">
								{{getSignLinkTypDesc(cli.linkTyp)}}:{{cli.BottomSignDesc ? cli.BottomSignDesc : cli.cliNm }}
								<img :src= "cli.SignFileImage ? cli.SignFileImage : (str+qm)" v-show="cli.SignFileId" :id="setImgId('imgSign',cli.cliNum + cli.linkTyp)" style="max-height:60px;max-width:120px;" /> <!-- :src="cli.SignFileImage ? (str + cli.SignFileImage) : (str+qm)" -->
							</span>
                        </row>   
                    </div>
                    
                </Panel>
            </Collapse>
          
            <row style="text-align:center">
                <i-button id="completeBtn" type="primary" @click="complete" :disabled="finishESign" >递交投保</i-button>
            </row>
            <div style="height:60px; opacity: 0;"></div>
            
        </Card>
         <div id="system-form-dialog" style='display:none;'></div>
        <Modal v-model="defmod" :closable="true" id="accont-box" width="77%">
            <div style="max-height:55vh;overflow-y: auto; -webkit-overflow-scrolling: touch;">
           <Collapse v-model="panelValue2">
            <Panel name="1">
                <span>扣款账号</span>
                <div slot="content">
                    <!--  扣款账号模板 -->
                    <template id="tem-deduction">
                        <i-form :model="deductionAccount" :label-width="150" style="margin-left:8%;">
                            <form-item label="账户持有人">
                                <radio-group v-model="disabledGroup" @on-change="choosePerson">
                                    <radio :disabled="IsSameAsInsured" label="投保人"></radio>
                                    <radio :disabled="IsSameAsInsured" label="被保险人"></radio>
                                </radio-group>
                            </form-item> 
                            <form-item label="账户持有人姓名">
                                <span>{{deductionAccount[personIndex].holderName}}</span>
                            </form-item>
                            <form-item label="账户持有证件类型">
                                <span>{{cardTypeCn}}</span>
                            </form-item>  
                            <form-item label="账户持有证件号码">
                                <span>{{deductionAccount[personIndex].holderCardNum}}</span>
                            </form-item>  
                    
                                
                            <form-item label="银行名称">
                                <i-select v-model="chooseBackCode"
                                    :class="{'newBorder':!chooseBackCode}"
                                     @on-change="setBankValue($event,deductionAccount[personIndex])" style="width:76%">
                                    <i-option :value="item.key" v-for="(item,index) in bankList" :key="index">{{item.value}}</i-option>
                                </i-select>
                               
                                <img id="InsuredOCRCtl" src="../Content/images/yhk.png" style="height:24px; margin-left:10px;vertical-align: middle;marin-left:10px;" @click="callOCR('B');" />
                            </form-item>  
                    
                            <form-item label="开户分行">
                                <i-input :class="{'newBorder':!deductionAccount[personIndex].accountbranch}" v-model="deductionAccount[personIndex].accountbranch" placeholder="开户分行"></i-input>
                                <p v-show="!deductionAccount[personIndex].accountbranch" class="red">开户分行不能为空</p>
                            </form-item> 
                    
                            <form-item label="开户地">
                                    <i-input :class="{'newBorder': !deductionAccount[personIndex].accountPlace}" v-model="deductionAccount[personIndex].accountPlace" placeholder="开户地"></i-input>
                                    <p v-show="!deductionAccount[personIndex].accountPlace" class="red">开户地不能为空</p>
                            </form-item> 
                            <form-item label="账户号码">
                                    <i-input :class="{'newBorder': !deductionAccount[personIndex].accountNum}" v-model="deductionAccount[personIndex].accountNum" placeholder="账户号码"></i-input>
                                    <p v-show="!deductionAccount[personIndex].accountNum" class="red">账户号码不能为空</p>
                            </form-item> 
                        </i-form>
                    </template>
                </div>
            </Panel>
            <Panel name="2">
                <span>给付账号</span>
                <div slot="content">
                    <template id="tem-pay">
                        <i-form :model="deductionAccount" :label-width="200" style="margin-left:8%;">
                            
                            <form-item label="付款账号同时设立为给付账号">
                                     <!-- addAccNum == eappBankClientList.length || sameYes -->   
                                    <i-switch :disabled="sameYes" style="margin-top:5px;" v-model="deductionAccount[personIndex].asdca" size="large" @on-change="payAccountHandle">
                                        <span slot="open">On</span>
                                        <span slot="close">Off</span>
                                    </i-switch>
                            </form-item> 
                            <div v-show="deductionAccount[personIndex].asdca" style="margin-left:8%;">
                                <h3 class="tit">给付账号</h3>

                                <form-item label="账户持有人">
                                    <span>{{disabledGroup}}</span>
                                </form-item> 
                                <form-item label="账户持有人姓名">
                                    <span>{{deductionAccount[personIndex].holderName}}</span>
                                </form-item>
                                <form-item label="账户持有证件类型">
                                    <span>{{cardTypeCn}}</span>
                                </form-item>  
                                <form-item label="账户持有证件号码">
                                    <span>{{deductionAccount[personIndex].holderCardNum}}</span>
                                </form-item>  

                                <form-item label="银行名称">
                                    <span>{{getBankNameCn(deductionAccount[personIndex].bankCode)}}</span>
                                </form-item>  
                                <form-item label="开户分行">
                                    <span>{{deductionAccount[personIndex].accountbranch}}</span>
                                </form-item>  
                                <form-item label="开户地">
                                    <span>{{deductionAccount[personIndex].accountPlace}}</span>
                                </form-item>  
                                <form-item label="账户号码">
                                    <span>{{deductionAccount[personIndex].accountNum}}</span>
                                </form-item>              
                            </div>
                        </i-form>
                        
                        
                        <div v-show="!switch2" style="border-bottom: 1px dashed #dcdcdc;height:1px;margin-bottom: 10px"></div>
                        
                    
                        <div> <!-- 临时 -->
                            <card show="paymentAccount.length >= 1" style="margin-bottom: 10px;" v-for="(item,index) in paymentAccount" key="index">
                                 <i-form :model="item" :label-width="150">
                                    <form-item label="账户持有人姓名">
                                            <i-select :class="{'newBorder': !item.holderName || addState}" v-model="item.holderName" @on-change="setBankClient" :disabled="item.SaveInd=='Y'">
                                                <i-option v-for="data in item.eappBankClientList" :disabled="deductionAccount[personIndex].asdca && deductionAccount[personIndex].holderName == data.ClientName" :value="data.ClientName">{{data.ClientName}}</i-option>
                                            </i-select>
                                            <p v-show="!item.holderName || addState" class="red">账户持有人不能为空或重复</p>
                                    </form-item> 
                                    <form-item label="账户持有人"><!--  item.holderName-->
                                        <span>{{item.LinkTypeDesc}}</span>
                                    </form-item>
                                    <form-item label="账户持有证件类型">
                                        <span>{{item.holderCardTypeDesc}}</span>
                                    </form-item>  
                                    <form-item label="账户持有证件号码">
                                        <span>{{item.holderCardNum}}</span>
                                    </form-item>  
                            

                                    <form-item label="银行名称">
                                        <i-select :class="{'newBorder':!item.bankCode}" v-model="item.bankCode" @on-change="setBankValue($event,item)">
                                            <i-option :value="item2.key" v-for="(item2,index) in bankList" :key="index">{{item2.value}}</i-option>
                                        </i-select>
                                        <img id="InsuredOCRCtl" src="../Content/images/yhk.png" style="height:24px;margin-left:10px; vertical-align: middle;marin-left:10px;" @click="callOCR('B',index);" />
                                        <p v-show="!item.bankCode" class="red">银行名称不能为空</p>
                                    </form-item>      
                            
                                    <form-item label="开户分行">
                                        <i-input :class="{'newBorder':!item.accountbranch}" v-model="item.accountbranch" placeholder="开户分行"></i-input>
                                        <p v-show="!item.accountbranch" class="red">开户分行不能为空</p>
                                    </form-item> 
                            
                                    <form-item label="开户地">
                                            <i-input :class="{'newBorder':!item.accountPlace}" v-model="item.accountPlace" placeholder="开户地"></i-input>
                                            <p v-show="!item.accountPlace" class="red">开户地不能为空</p>
                                    </form-item> 
                                    <form-item label="账户号码">
                                            <i-input :class="{'newBorder':!item.accountNum}" v-model="item.accountNum" placeholder="账户号码"></i-input>
                                            <p v-show="!item.accountNum" class="red">账户号码不能为空</p>
                                    </form-item>
                                </i-form>
                                
                                <icon @click="del(item,index)" style="position:absolute;top:20px;right:20px;color:red;cursor: pointer;" type="ios-trash-outline" size="24" />
                            </card>
                        </div>

                        <row type="flex" justify="center">
                            <col span="24">
                                <i-button v-show="addAccState" type="primary" @click="addAcc">+ 给付账号</i-button> <!-- addAccState -->
                            </col>
                        </row>
                    
                    </template>
                        
                </div>
            </Panel>
         
            </Collapse>     
            </div>
            <div slot="footer">
                <i-button type="text" size="large" @click="accountCancel">取消</i-button>
                <i-button type="primary" size="large" @click.prevent="accountOk">确定</i-button>
            </div>
        </Modal>

        <!-- 文档确认弹层 -->
        <Modal v-model="modalDocumentInfo" width="90%" :footer-hide="true" :closable="false">
            <p slot="header" style="color:#19be6b;text-align:center">
                <Icon type="ios-information-circle"></Icon>
                <span>{{modalDocTitle}}</span>
            </p>
            <div style="text-align:center;">
                <div class="pop-tips" v-show="false">提示文案</div>
                <Carousel v-if="modalDocumentInfo" :arrow="document.length > 1 ? 'always' : 'never'" dots="none">
                    <Carousel-Item v-for="url in document" :key="documentIndex">
                        <div style="text-align:center">
                            <img id="pdfImg" style="width:100%;" :src="url" />
                        </div>
                    </Carousel-Item>
                </Carousel>
                <i-button :disabled="closeBtnState && doubleShow && (docName=='reminder' || docName=='declaration')" @click="closePop(docName)" type="primary" style="width:70px;position:absolute;right:25px;top:10px;">关闭</i-btutton>
            </div>
        </Modal>

        <!-- 抄录预览弹层 doublerecord-2nd-phase carrier.zhang-->
        <Modal v-model="commentStateModal" width="90%" :footer-hide="true" :closable="false">
            <p slot="header" style="color:#19be6b;text-align:center">
                <Icon type="ios-information-circle"></Icon>
                <span>抄录预览</span>
            </p>
            <div style="text-align:center;">
                <img id="imgComment" style="width:90%" />
                <i-button @click="closeCommentState()" type="primary" style="width:70px;position:absolute;right:25px;top:10px;">确定</i-btutton>
            </div>
        </Modal>

        <!-- 双录 文档  -->
        <Modal v-model="doubleDocumentInfo" width="90%" :footer-hide="true" :closable="false">
            <p slot="header" style="color:#19be6b;text-align:center">
                <Icon type="ios-information-circle"></Icon>
                <span>{{modalDocTitle}}</span>
            </p>
            <div style="text-align:left;">
                <Carousel v-if="showPdf" :arrow="document.length > 1 ? 'always' : 'never'" dots="none" @on-change="changePage"  v-model="documentIndex">
                    <Carousel-Item v-for="(url,index) in document" :key="index">
                        <div style="text-align:center">
                            <!-- <p>我是双录文档介绍</p> -->
                            <img id="pdfImg" style="width:100%;" :src="url" />
                        </div>
                    </Carousel-Item>
                </Carousel>
                <div style="padding:0 30px;" v-else>
                    <div style="text-align:left;">
                        <template v-for="item in docData">
                            <p style="margin-bottom:10px;" v-html="item"></p>
                        </template>
                    </div>
                </div>
                
                <i-button @click="closePop(docName)" type="primary" style="width:70px;position:absolute;right:25px;top:10px;">关闭</i-btutton>
            </div>
        </Modal>
    

        <!-- 持证拍照弹层 -->
        <Modal id="recoModal" v-model="recoModal" width="50%" :closable="false" :mask-closable="true" :z-index="900">
            <p slot="header" style="color:#19be6b;text-align:center">
                <Icon type="ios-information-circle"></Icon>
                <span>身份验证</span>
            </p>
            <div v-show="showWithID">
                <Card style="width:100%">                                            
                    <div style="text-align:center">
                        <!-- http://localhost:8081/awsnet/Content/images/MSL_WeChat_QR.jpg -->
                        <div class="pzBox" style="margin-right:10px;">
                            <img class="icon" src="../Content/images/camera.png">
                            <input style="height:100%" type="file" class="fileinput-button" style="width:100%;" capture="camera" accept="image/*" id="cameraFaceAuthInput2">
                            
                             <p class="camera-text">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;请申请人进行持证拍照&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
                            <div class="imgShow" v-show="faceDataMap.coverState1">
                                <div v-for="item in faceDataMap.forward">
                                    <img :src="item.url" />
                                </div>
                            </div> 
                            
                        </div>
                        <div class="btn-box" v-show="faceDataMap.forward.length>=1">
                            <Icon  @click.stop="handleRemove" class="btn-icon del" type="ios-trash-outline"></Icon>
                            <Icon @click.stop="lookPhoto" class="btn-icon search" type="ios-search"></Icon> <!-- ios-trash-outline -->
                        </div>
                         
                    </div>
                   
                    <Card :bordered="false" style="margin-top:10px;">
                        <p slot="title" class="mt30">
                            <span class="color-green">注意事项：</span>
                        </p>

                        <p>1、本次业务需要核实申请人身份，请拍摄客户手持身份证件的照片；</p>
                        <p>2、拍摄时：请客户手持身份证件，正对摄像头，保持光线充足；</p>
                        <p>3、点击查看图标，可查看图片大小；</p>
                        <p>4、如需重新拍摄，请先点击删除图标，再重新拍摄。</p>
                        
                    </Card>
                </Card>    
            </div>
            <div v-show="!showWithID">  <!-- showWithID  人脸识别-->
                 <row style="margin-bottom:15px;">
                    <Checkbox v-model="readAuth">本人已阅读并同意<a href="javascript:void(0)" @click="showFaceAuth">《人脸识别授权协议书》</a></Checkbox>
                </row>    
                <Card style="position:relative;width:230px; height:115px;overflow:hidden;margin:0 auto; margin-top:40px;border:1px solid #20b977; border-radius:5px;">
                    <div style="text-align:center">
                         <!-- <Icon type="ios-camera" style="font-size:80px;"></Icon> pillar -->
                        <img class="icon" src="../Content/images/camera.png" style="width:60px;">
                        <div class="cameraPop" v-show="isLoading" style="position:absolute;top:0;left:0;width:100%;height:100%;background:#fff;opacity: 0.5;"></div>
                        <input type="file" :disabled="!readAuth && !isLoading" class="fileinput-button" style="width:230px; height:115px;" capture="camera" accept="image/*" id="cameraFaceAuthInput">
                    </div>
                    <row style="margin-top:10px;text-align: center;">
                        <p style="color:#777">请点击拍摄</p>
                    </row>
                </Card>
               
                <Card :bordered="false" style="margin-top:10px;">
                    <p slot="title" class="mt30">
                        <span class="color-green">注意事项：</span>
                    </p>
                    <p>1、为了保障你的权益，本次业务采用人脸识别的方式核实申请人信息；</p>
                    <p>2、拍摄时：请客户正对摄像头，摘掉眼镜，保持光线充足；</p>
                    <p>3、人脸识别三次未通过将进行持证拍照</p>
                </Card>
            </div>
            <div slot="footer">
                <i-button type="primary" size="large" long @click="closeRecoModal" v-show="showWithID">确定</i-button>
            </div>
        </Modal>
        <Modal v-model="authBookModal" width="77%" :closable="true"  :mask-closable="false">
            <p slot="header" style="color:#19be6b;text-align:center">
                <span>人脸识别授权协议书</span>
            </p>
            <Card :bordered="false" style="margin-top:4px;">
                    <p style="margin-bottom:10px;">1、本人已详细阅读、理解并接受本协议全部内容。本人同意并授权中宏人寿保险有限公司（以下简称“中宏保险”）采集本人的个人信息（包括人脸识别信息）。本人的个人信息（包括人脸识别信息）可供中宏保险及因业务必要而委托的法律法规允许的机构或政府机关授权的机构用以进行身份审核验证。</p>
                    <p style="margin-bottom:10px;">2、本人确认在使用人脸识别身份验证时提供的信息是本人的信息，并确认该信息真实完整。并同意中宏保险依照<a href="http://www.manulife-sinochem.com/yssm.html" target="_blank">《中宏保险隐私准则声明》</a>对本人个人信息（包括人脸识别信息）进行保护。</p>
                    <p style="margin-bottom:10px;">3、本人理解，由于技术水平限制，中宏保险暂时无法保证人脸识别服务成功，若人脸识别服务验证失败，可以通过持证拍照进行身份验证。在通过人脸识别服务或持证拍照服务后，本人在拥有该服务的渠道上办理的中宏保险所有保单业务，为本人的真实操作，具有真实意愿。</p>
                </Card>
            <div slot="footer">
                <i-button type="primary" size="large" long @click="closeAuthBookModal">我接受</i-button>
            </div>
        </Modal>

        <Modal v-model="zoomPhoto" width="77%" :closable="true"  :mask-closable="false" id="zoomPhoto">
            <div style="text-align:center;max-width:500px; max-height:500px; margin: 50px auto 40px auto;"  v-for="item in faceDataMap.forward">
                <img style="width:100%;" :src="item.url" />
            </div>
            <div slot="footer"></div>
        </Modal>

        <!-- 60的分钟弹框  -->
        <Modal v-model="timeTipModal" width="77%">
            <p slot="header" style="color:#19be6b;text-align:center">
                <span>时间提示</span>
            </p>
            <div style="max-height:60vh;overflow-y: auto; -webkit-overflow-scrolling: touch;">
                <span>{{timeMsg}}</span> 
             </div>
            <div slot="footer" style="text-align:center">
                <i-button v-show="!(timeInfo.IsTimeOut == 'Y')" type="primary" size="large" @click="flowGo(typeName,currentData.linkTyp,currentData.cliNum)">继续</i-button>
                <i-button v-show="timeInfo.IsTimeOut == 'Y'" type="primary" size="large" @click="flowRestart">立即开始</i-button>
                <i-button v-show="timeInfo.IsTimeOut == 'Y'" type="cancel" size="large" @click="flowCancel">稍后继续</i-button>
            </div>
        </Modal>


        <!--  orc 弹框  -->
        <Modal v-model="orcModel" width="65%" id="orcModel">
            <div slot="header" style="position:absolute;width:100%;top:0;left:0;color:#fff;text-align:center;background:#00A758;height:30px;line-height:30px;text-indent:10px;text-align:left;">OCR识别</div>
            <div class="componentFormOcr" style="max-height:60vh;overflow-y: auto; -webkit-overflow-scrolling: touch;margin-top:10px;">
                <div class="file--wrapper" style="margin-top:25px;">
                    <div class="fileinput-item">
                        <img src="../Content/images/camera.png" v-if="showFront" width="100" />
                        <img :src="imgFront" v-if="!showFront" />
                        <p class="color-green mt15" style="font-size:12px" v-if="ocrType == 'B'">请拍摄您的银行卡</p>
                        <input type="file" id="cameraInputFront" capture="camera" accept="image/*" />
                    </div>
                </div>

                <div class="ui-orc" v-if="ocrType == 'B'">
                    <dl class="row">
                        <dt>
                            <label>银行名称</label>
                        </dt>
                        <dd>
                            <input style="width:157px;" type='text' v-model='formItem.bankName' name="BankName" maxlength="30" readonly="readonly" />
                        </dd>
                    </dl>
                    <dl class="row">
                        <dt class="ml30b">
                            <label>银行卡号</label>
                        </dt>
                        <dd>
                            <input style="width:157px;" type='text' v-model='formItem.account' name="Account" maxlength="30" />
                        </dd>
                    </dl>
                </div>
                <div v-if="ocrType == 'B'">
                    <h3 class="color-green" style="border-bottom:1px solid #ddd;margin-top: 25px;margin-bottom: 10px;  padding-bottom: 10px;"><b>注意事项</b></h3>
                    <p class="color-green" style="color:#000000;margin-top:15px;">1、拍摄时：银行卡占据屏幕正中三分之二、清晰完整，避免光线昏暗或屏幕上出现反光；</p>
                    <p class="color-green" style="color:#000000;">2、拍摄完：请确认识别出的银行卡信息正确后再提交，如有误可手工修改后提交。</p>
                </div>

             </div>
            <div slot="footer" style="text-align:center">
                <i-button type="cancel" size="large" @click="closeOcr" style="margin-right:20px;">取消</i-button>
                <i-button type="primary" size="large" @click="sureOcr" style="margin-left:20px;">确定</i-button>
                
            </div>
            <div slot="close" style="font-size:16px;line-height:16px;margin-right:5px;color:#fff;">X</div>
        </Modal>

        <!--  财务问卷取消提示 -->
        <Modal v-model="cwTipModal" width="40%">
            <div style="max-height:60vh;overflow-y: auto; -webkit-overflow-scrolling: touch;">
                <span>已填写财务问卷，是否确认取消</span> 
             </div>
            <div slot="footer" style="text-align:center">
            
                <i-button type="primary" size="large" @click="cwGO">继续</i-button>
                <i-button type="cancel" size="large" @click="cwBack">返回</i-button>
            </div>
        </Modal>

        <!-- alert弹框  -->
        <Modal v-model="alertState">
            <div style="margin-top:35px;margin-bottom:20px">{{alertMsg}}</div>
        </Modal>
    
        <!-- orc 确认弹框    -->  
        <Modal v-model="ConfirmModDiv">
            <p slot="header" style="color:#19be6b;text-align:center">
                <span>信息确认</span>
            </p>
            <div style="max-height:60vh;overflow-y: auto; -webkit-overflow-scrolling: touch;">
                 <div class="ocr-info-list">
                    <div class="item" v-if="ocrType == 'C'">
                        <label>姓名</label>：<span class="text">{{formItem.name}}</span>  
                    </div>
                    <div class="item" v-if="ocrType == 'C'">
                        <label>性别</label>：<span class="text" v-if="formItem.gender === 'F'">女</span><span v-else-if="formItem.gender === 'M'">男</span><span v-else>   </span>                                
                    </div>
                    <div class="item" v-if="ocrType == 'C'">
                        <label>出生日期</label>：<span class="text">{{formItem.birthDate}}</span>  
                    </div>
                    <div class="item" v-if="ocrType == 'C'">
                        <label>证件号码</label>：<span class="text"  >{{formItem.idNum}}</span>  
                    </div>
                    <div class="item" v-if="ocrType == 'C'">
                        <label>有效日期</label>：<span class="text" >{{formItem.expiryDate}}</span>  
                    </div>
                    <div class="item" v-if="ocrType == 'C'">
                        <label>国籍</label>：<span class="text"  >{{formItem.nationality}}</span>  
                    </div>
                    <div class="item" v-if="ocrType == 'B'">
                        <label>银行名称</label>：<span class="text" >{{formItem.bankName}}</span>  
                    </div>
                    <div class="item" v-if="ocrType == 'B'">
                        <label>银行卡号</label>：<span class="text">{{formItem.account}}</span>  
                    </div>
                </div>
                <p class="ocr-tips" v-if="ocrType == 'C'">请您仔细核对以上信息，确保与证件信息完全一致。如证件信息不一致，将会影响后续业务办理</p>
                <p class="ocr-tips" v-if="ocrType == 'B'">请您仔细核对以上信息，确保与银行卡信息完全一致。如银行卡信息不一致，将会影响后续业务办理</p>
             </div>
            <div slot="footer" style="text-align:center">
                <i-button  @click="clsoeSureModal" type="cancel" size="large" @click="cwBack">取消</i-button>
                <i-button  @click="confirmOCRData" type="primary" size="large" @click="cwGO">确认</i-button>
            </div>
        </Modal>

        <Modal v-model="showInfoState" :footer-hide="false" :closable="false">
            <p slot="header" style="color:#19be6b">
                <span>信息</span>
            </p>
            <div style="max-height:60vh;overflow-y: auto; -webkit-overflow-scrolling: touch;">
                 <p v-html='infoMsg'></p>
             </div>
            <div slot="footer" style="text-align:right">
                <i-button type="primary" size="large" @click="showInfo">确认</i-button>
            </div>
        </Modal>
    </template>
    
    <component-bank-transfer ref="backCom" v-bind:bank-form-item="bankFormItem" v-bind:show-bank-transfer="showBankTransfer"></component-bank-transfer>
    <component-financial ref="cwwqCom" :financial-form-item="financialFormItem" :show-financial="showFinancial" :test="test1"></component-financial>
   
</div>
<canvas id="routeCanvas" style="position:absolute;left:-999999999999px;"></canvas>
<!-- 语句抄录区域 -->
<div id="comment_dialog" style="display:none;position:fixed;">
	<div id="leftView">
		<p id="comment_title"></p>
		<div id="signImage" class="signImagecss"></div>
	</div>
	<div id="tmpcanvascss" class="tmpcanvascss">
		<div id="signTitle" class="mass_text"></div>
		<canvas id="comment_canvas"></canvas>
	</div>
    <p style="position:absolute;bottom:105px;left:45px;width:360px;font-size:18px;">提示：如您之前的文字输入有误，可直接点击最上方相应文字，并在描红框中重新输入。</p>
	<div id="comment_btnContainerInner" class="comment_btncontainer">
		<input id="comment_ok" type="button" class="button orange" value="确 定" style="font-size:18pt">
		<input id="comment_back" type="button" class="button orange" value="后 退" style="display:none">
		<input id="comment_cancel" type="button" class="button orange" value="退 出" style="font-size:18pt"> 
	</div>
</div>
<div id="grid_comment_dialog" style="display:none;position:fixed;">
    <div id="leftView">
        <p id="comment_title"></p>
        <div id="grid_signImage" class="signImagecss" style="display:none;"></div>
    </div>
    <div id="grid_comment_group">
        <div id="add_canvas_place"></div>
    </div>
    <div id="grid_comment_btnContainerInner" class="comment_btncontainer">
        <input id="grid_comment_ok" type="button" class="button orange" value="确 定">
        <input id="grid_scrollTop" type="button" class="button orange" value="向 下">
        <input id="grid_scrollBottom" type="button" class="button orange" value="向 上">
        <input id="grid_comment_cancel" type="button" class="button orange" value="取 消">
    </div>
</div>
<center>
    <div id="dialog" style="display:none;">
	    <!-- 显示签名区域-->
	    <div id="anysign_title" style="color:#333;display:block;margin-left:5px;text-align:left;color:#00A758;" width="100%" height="10%">请投保人<span style="font-size:20pt;"> 李 元 </span>签名</div>
	    <div id="container" onmousedown="return false;" style="border-color:#00A758;">
		    <canvas id="anysignCanvas" width="2"></canvas>
	    </div>
	    <div id="single_scrollbar" style="text-align:center;vertical-align:middle;width:100%;margin-top:10px;">
		    <span id="single_scroll_text"> *滑动操作：</span>
		    <input id="single_scrollbar_up" type="button" class="button orange" value=""  />
		    <input id="single_scrollbar_down" type="button" class="button orange" value="" />
	    </div>
	    <div id="btnContainerOuter" width="100%">
		    <div id="btnContainerInner" style="text-align:center;font-size:5pt;width:100%">
			    <input id="btnOK" type="button" class="button orange" value="确 定" style="font-size:22pt" onclick="sign_confirm();" />
			    <input id="btnClear" type="button" class="button orange" value="清 屏" style="font-size:22pt" onclick="javascript:clear_canvas();">
			    <input id="btnCancel" type="button" class="button orange" value="取 消" style="font-size:22pt" onclick="cancelSign();">
		    </div>
	    </div>
    </div>
    <input id="hideApplicationNumber" value="<%: ViewData(eAppWebConstants.CURRENT_VIEW_EAPP_APPLICATION_NUMBER) %>" />
</center>

<%Html.RenderPartial("ESign_BankAutoTransferAuth")%>
<%Html.RenderPartial("ESign_Financial")%>
<script src="<%: Url.Content("~/Scripts/exif.js")%>" type="text/javascript"></script> 
<script src="<%: Url.Content("~/Scripts/jquery.datePicker.js")%>" type="text/javascript"></script> 
<script src="<%: Url.Content("~/Scripts/eSignature.js?v="+timeNowString)%>" type="text/javascript"></script> 

