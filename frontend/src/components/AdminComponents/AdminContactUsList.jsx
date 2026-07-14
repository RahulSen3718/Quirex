import React, { useEffect, useState } from 'react'
import NavBar from '../landingComponents/NavBar'
import axios from 'axios'
const AdminContactUsList = () => {
  const [list, setList] = useState([])
  useEffect(() => {
    fetchData();
  }, [])
  const fetchData = async () => {

    const response = await axios.post('http://localhost:9000/api/contact-us-list'

    );
    if (response?.data?.code == 200) {
      setList(response?.data?.data)
    }
  };

  const show = (data) => {
    Swal.fire({
      title: "Message",
      text: data,
      icon: "information"
    })
  }
  return (
    <>
      <NavBar />
      <div className="row">
        <h1 className='text-danger text-center'>Contact List </h1>
        <div className="col-sm-1"></div>
        <div className="col-sm-10">
          {/* table ki starting */}
          <table className="table">
            <thead className='table table-dark'>
              <tr>
                <th scope="col">Sr.No.</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Contact No.</th>
                <th scope="col">Subject</th>
                <th scope="col">Message</th>

              </tr>
            </thead>
            <tbody>
              {list?.map((item, index) => {
                return (
                  <>
                    <tr>
                      <th scope="row">{index + 1}</th>
                      <td>{item?.name}</td>
                      <td>{item?.email}</td>
                      <td>{item?.contact}</td> 
                      <td>{item?.message}</td>
                      <td onClick={()=>show(item?.message)}>{item?.message?.slice(0, 30)}...</td>

                    </tr>
                  </>)
              })}


            </tbody>
          </table>
          {list?.length == 0 && <p className='text-center'>No Record Found!</p>}

        </div>
        <div className="col-sm-1"></div>
      </div>
    </>
  )
}

export default AdminContactUsList