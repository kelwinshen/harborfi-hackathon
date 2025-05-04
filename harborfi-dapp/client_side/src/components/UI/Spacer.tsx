import React from 'react'

const Spacer = ({ height } : { height: number }) => {
  return (
    <div className="w-full container mx-auto" style={{ height }}></div>
  )
}

export default Spacer