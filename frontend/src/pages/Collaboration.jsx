import React from 'react';

export default function Collaboration() {
  return (
    <div className='mt-16 xl:mt-24'>
      <div className="container mx-auto px-4 py-16">
        <div className="content mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Why Collaborate With Us?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Expert Team</h3>
              <p className="text-gray-600">Work with experienced professionals who understand your business needs.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Innovative Solutions</h3>
              <p className="text-gray-600">Get cutting-edge solutions tailored to your specific requirements.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
