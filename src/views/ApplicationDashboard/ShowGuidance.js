import React, { Component } from 'react';
import { Row, Col, Card, CardFooter, Button, CardBody} from 'reactstrap';
import imageshowguidance from '../../assets/img/showguidanceimg.jpg';
class ShowGuidance extends Component {
 
render() {
return (
    <div className="animated">
    <div className="col-md-12">
                    <Col xs="12" sm="12">
    <Card className='mt-lg-4 mb-lg-4' style={{boxShadow:'0 4px 7px #0000001f'}}>
        <CardBody className="pb-lg-3 pt-lg-3">
            <Col sm="12" xs="12" className="pl-0">
                <h2 className='ShowGuidanceTitle'>Intro to QAT Forecasting </h2>
               <p className='ShowGuidancePText'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer id nulla et tellus porta mattis. 
               Vestibulum lacus massa, scelerisque ac mi ut, faucibus condimentum purus. Proin
                pulvinar ac purus eget dignissim. Ut consequat massa non feugiat efficitur. 
                In ac nibh tempor, placerat sapien sodales, posuere tellus. <a href='#'>Version Settings</a> et 
                nec suscipit justo. Pellentesque aliquet pharetra enim a placerat. 
                Nullam nec lacus eget ipsum dapibus pellentesque a a nisl. Sed velit nunc, 
                suscipit at interdum a, finibus et elit. Maecenas vel sapien porta, elementum turpis sit amet, dictum diam. Donec bibendum ipsum ligula, ac tempor dolor euismod sed. Vivamus maximus egestas risus, euismod malesuada massa. </p>
                <div className='row'>
                <div className='col-md-4 pl-lg-5'>
                <img src={imageshowguidance} style={{width:'250px'}}/>
                </div>
                    <div className='col-md-8'>
                <p className='ShowGuidancePText'>If you want to use consumption, Quisque aliquam semper blandit. Fusce ac porttitor arcu, 
                eu finibus nisl. Donec malesuada nisi id varius scelerisque. Praesent imperdiet sem sed 
                mauris sollicitudin viverra. Curabitur tempor ut dui vitae convallis. Phasellus quis 
                nunc a felis accumsan posuere. Maecenas a lectus sed diam mattis ultrices. Fusce mattis 
                euismod nisl, eget scelerisque tellus euismod sed. Aenean in odio molestie, imperdiet 
                neque at, tristique nulla. Aenean odio velit,<br></br> <a href='#'>Data Entry and Adjustment</a>, a, feugiat 
                suscipit elit. Fusce mauris ipsum, aliquam sit amet efficitur eu, mollis sed justo. 
                Ut nec sem et mi dictum <br></br><a href='#'>Consumption Extrapolation</a>,. Aliquam in mi posuere lectus 
                tempor sollicitudin aliquet vitae diam. Suspendisse bibendum tortor et orci tempus, 
                nec maximus nisi porttitor.</p>
                </div>
                </div>

                <p className='ShowGuidancePText'>If you want to use the tree, <a href='#'>Manage Tree</a>, Morbi convallis diam eget tortor tempor 
                dapibus. Vivamus quis urna ac erat elementum link et eget turpis. Phasellus link 
                scelerisque feugiat. Maecenas ut odio mattis, porttitor est eget, auctor felis.  </p>

                <p className='ShowGuidancePText'>Maecenas <a href='#'>Compare and Select</a> rhoncus. Etiam tempor aliquam sapien, 
                sed scelerisque nisl efficitur ac. Cras sit amet mauris facilisis,
                 tristique quam vel, <a href='#'>Monthly Forecast</a>. Donec lorem ligula, porta nec felis sit amet, 
                 fermentum interdum justo. Duis vitae consequat tellus, vitae <a href='#'>Forecast Summary</a> diam.</p>

                
                     {/* <div className='row text-center'>
                     <div className='col-md-12'><img src={imageshowguidance} className="" /></div>
                     </div> */}
                 
                </Col>
        </CardBody>
    </Card>
    </Col>
    </div>

</div>

)
}
}

export default ShowGuidance;