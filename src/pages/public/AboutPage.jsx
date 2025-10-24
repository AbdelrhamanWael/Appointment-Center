import React from 'react'

function AboutPage() {
  return (
    <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-gray-200 rounded-lg h-80 flex items-center justify-center">
                <img src="../src/assets/images/photo-1631217868264-e5b90bb7e133.jpeg" alt="" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">About Our Medical Center</h2>
                <p className="text-gray-600 mb-4">
                  With over 25 years of excellence in healthcare, our medical center has been serving the community with state-of-the-art facilities and experienced medical professionals.
                </p>
                <p className="text-gray-600 mb-4">
                  We offer comprehensive healthcare services ranging from primary care to specialized treatments, ensuring every patient receives personalized attention and the highest quality of care.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    24/7 Emergency Services
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Expert Medical Staff
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Modern Equipment
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
  )
}

export default AboutPage