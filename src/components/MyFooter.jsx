import React from 'react'

const MyFooter = () => {
  return (
    <div>
      {/* <footer className="bg-dark text-white text-center py-3">
        <p className="mb-0">
          © {new Date().getFullYear()} Spidex Online Market — All Rights Reserved.
        </p>
      </footer> */}

      <footer className="bg-dark text-white text-center py-3 mt-5">
        <p className="mb-0">
         Copyright © {new Date().getFullYear()} Spidex Online Market. All Rights Reserved.
        </p>
      </footer>
    </div>
  )
}

export default MyFooter
