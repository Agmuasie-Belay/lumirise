export default function DashboardHead({heading, sup, Icon, subtitle, title, access_description, role}){
    return (
        <div>
          <div className="flex gap-x-2">
            <h1 className="text-3xl font-bold">{heading}</h1>
            <span className={`flex ${role==="admin"? "bg-red-600": "bg-black"} h-fit rounded-2xl text-white text-[12px] px-2 py-0.5  mt-1 font-bold`}>
              <span className="flex">
                <Icon className="w-4 h-4" />
              </span>
              <span> {sup}</span>
            </span>
          </div>
          <p className="text-left  text-[16px] text-gray-500">
            {subtitle}
          </p>
          <div className={`flex flex-row text-left my-6 border ${role==="admin"? "border-red-200 bg-red-50":"border-green-200 bg-green-50"} p-6 rounded-[8px]`}>
            <div className="my-auto mr-4">
              <Icon className={`flex w-8 h-8 ${ role==="admin"?"text-red-800":"text-green-800"}`} />
            </div>
            <div>
              <h2 className={`font-bold text-[18px] ${role==="admin"?"text-red-900":"text-green-900"}`}>
                {title}
              </h2>
              <p className={`${role==="admin"?"text-red-700":"text-green-700"}`}>
                {access_description}
              </p>
            </div>
          </div>
        </div>
      
    )
}