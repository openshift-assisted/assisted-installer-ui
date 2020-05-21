import * as Yup from 'yup';

export default Yup.object().shape({
  pullSecret: Yup.string().when('$providePullSecret', {
    is: true,
    then: Yup.string().required('Required'),
  }),
  username: Yup.string().when('$providePullSecret', {
    is: false,
    then: Yup.string().required('Required'),
  }),
  password: Yup.string().when('$providePullSecret', {
    is: false,
    then: Yup.string().required('Required'),
  }),
});
