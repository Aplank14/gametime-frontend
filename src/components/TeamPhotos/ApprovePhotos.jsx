import React, { useState, useEffect } from "react";
import { useParams, Redirect } from 'react-router-dom';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import CheckIcon from '@material-ui/icons/Check';
import Modal from 'react-bootstrap/Modal';
import { useSelector } from 'react-redux';
import Button from '@material-ui/core/Button';
import Feedback from '../Common/Feedback';
import { getPhotos, setPhotoVisibility } from '../../utils/photos/photos'
import './TeamPhotos.scss';
 
const useStyles = makeStyles(() => ({
    titleBar: {
        background:
          'linear-gradient(to top, rgba(0,0,0,0.7) 0%, ' +
          'rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
      },
      icon: {
        color: 'white',
      },
}));

const ApprovePhotos = () => {
    const { team_id } = useParams();
	function selector(store) {
		return {
            permissionLevel: store.user.teams[store.status.selected_team] 
                ? store.user.teams[store.status.selected_team].permission_level 
                : 0,
            signedIn: store.status.signed_in,
            team_id: team_id
		};
	}	
    
    const state = useSelector(selector);
    const classes = useStyles();
    const [isEmpty, setIsEmpty] = useState(false);
    const [photos, setPhotos] = useState([]);
    const [toApprove, setToApprove] = useState({});
    const [showApprove, setShowApprove] = useState(false);
    const [alertType, setAlertType] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [label, setLabel] = useState('');
    const [redirect, setRedirect] = useState(false);


    async function fetchPhotos() {
        const res = await getPhotos(state.team_id)
        setPhotos(res);
        setIsEmpty(res.every(p => p.active));
    }

    useEffect(() => {
        if(!state.signedIn || state.permissionLevel < 1){
            setRedirect(true);
        }
        else{
            fetchPhotos();
        }
    }, []);

    const handleApprove = async (photo) => {
        // call endpoint to set photo active]

        const apiObj = {
            team_id: state.team_id,
            file_id: photo.file_id,
            active: true
        }

        const res = await setPhotoVisibility(apiObj);

        setLabel('Success! The photo has been successfully approved.');
        setAlertType(res ? 'success' : 'danger');
        setShowAlert(true);

        const p = photos;
        p.forEach(p => {
            if(p.file_id === photo.file_id){
                p.active = true;
            }
        });
        setPhotos(p);
        setShowApprove(false);
        setIsEmpty(p.every(p => p.active));
    }

    const PhotoApproveModal = () => {
        const msg = 'Approve this photo?';
        return (
          <Modal
            show={showApprove}
            onHide={() => setShowApprove(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>Approve Photo</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {msg}
            </Modal.Body>
            <Modal.Footer>
              <Button style={{backgroundColor:'red'}} variant="contained" color="primary" onClick={() => setShowApprove(false)}>No</Button>
              &nbsp;
              <Button variant="contained" color="primary" onClick={() => handleApprove(toApprove)}>Yes</Button>
            </Modal.Footer>
          </Modal>
        )
    }

    if(redirect){
        return <Redirect to={{ pathname: `/team/${state.team_id}/home` }} />
    }
    
    return !isEmpty ? ( 
      <div className="fill-vert">
        <Feedback 
          alertType={alertType}
          showAlert={showAlert}
          setShowAlert={setShowAlert}
          label={label}
        />
        <div className="gallery-approve">
          <div>
            <PhotoApproveModal />
            <GridList cellHeight={200} cols={3}>
              {photos.map((tile) => !tile.active && (
                <GridListTile key={tile.file_id}>
                  <img src={tile.url} alt="img" />
                  <GridListTileBar
                    title={tile.title}
                    titlePosition="bottom"
                    actionIcon={state.permissionLevel >= 1 && (
                    <>
                      <IconButton 
                        className={classes.icon} 
                        onClick={() => { 
                          setShowApprove(true); 
                          setToApprove(tile)
                        }}
                      >
                        <CheckIcon />
                      </IconButton>
                    </>
                    )}
                    actionPosition="left"
                    className={classes.titleBar}
                  />
                </GridListTile>
                ))}
            </GridList>
          </div>
        </div>
      </div>
    )
    :
    (
      <>
        <Feedback 
          alertType={alertType}
          showAlert={showAlert}
          setShowAlert={setShowAlert}
          label={label}
        />
        <div className="fill-vert gallery-approve">
          <h3>There are currently no photos available to approve.</h3>
        </div>
      </>
    )
}

export default ApprovePhotos;

