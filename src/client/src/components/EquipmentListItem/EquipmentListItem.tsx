import './EquipmentListItem.css';

import React from 'react';
import {useNavigate} from 'react-router-dom';
import {Card, Button, Row, Col} from 'react-bootstrap';
import {Equipment} from 'src/types/equipment';

interface Props {
    equipmentItem: Equipment;
    setActiveEquipmentItem: (equipmentItem: Equipment) => void;
}

const EquipmentListItem: React.FC<Props> = (props) => {
    const navigate = useNavigate();

    const onOpenClick = () => {
        props.setActiveEquipmentItem(props.equipmentItem);
        navigate(`/${props.equipmentItem._id}`);
    };

    return (
        <Card style={{width: 'max-width: 540px'}} className="mb-3 equipment-list-item">
            <Row>
                <Col md={4} key="img">
                    {props.equipmentItem.imageUrl ? (
                        <Card.Img variant="top" src={props.equipmentItem.imageUrl} className="h-100 p-2" />
                    ) : null}
                </Col>
                <Col md={8} key="body">
                    <Card.Body>
                        <Card.Title>{props.equipmentItem.name}</Card.Title>
                        {props.equipmentItem.description ? (
                            <Card.Text className="line-clamp">{props.equipmentItem.description}</Card.Text>
                        ) : null}
                        <Button variant="primary" onClick={onOpenClick}>
                            Открыть
                        </Button>
                    </Card.Body>
                </Col>
            </Row>
        </Card>
    );
};

export default EquipmentListItem;
